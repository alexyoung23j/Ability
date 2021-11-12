import { EventFromServer } from 'DAO/CalendarDAO';
import { DateTime } from 'luxon';
import { CalendarIndex } from '../../../components/AllContextProvider';

import { assert } from '../assert';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const NUM_DAYS = Math.ceil(365 / 2) + 365;

export const enum Color {
  BLUE = 'BLUE',
}

export interface CalendarIndexEvent {
  startTime: gapi.client.calendar.EventDateTime;
  endTime: gapi.client.calendar.EventDateTime;
  // map color Id --> unique color that hasn't been used yet
  color: Color;
  eventHtmlLink: string | null;
  calendarId: string;
  summary: string;
  id: string;
  accountEmail: string;
  isAllDayEvent: boolean;
}

// Organized by start time
export interface CalendarIndexDay {
  events: Array<CalendarIndexEvent>;
  date: DateTime;
}

export function getDayAtIndex(
  calendarIndex: CalendarIndex,
  index: number = 0
): CalendarIndexDay {
  return calendarIndex[index];
}

export function getDateAtIndex(
  calendarIndex: CalendarIndex,
  index: number = 0
): DateTime {
  return calendarIndex[index].date;
}

/**
 * Given a date and a starting date, return what index in an array the date would be assuming the
 * starting date is at index 0, and we increment by 1 per day.
 * @param date
 * @param dateAtIndexZero
 * @returns number: index
 */
export function mapDateToIndex(
  date: DateTime,
  dateAtIndexZero: DateTime
): number {
  const normalizedDate = date.startOf('day');
  const normalizedStart = dateAtIndexZero.startOf('day');
  const diff = normalizedDate.diff(normalizedStart, 'day').toObject().days!;

  if (diff < NUM_DAYS && diff >= 0) {
    return diff;
  } else {
    return -1;
  }
}

function _getEventIndexInDay(
  eventsInDay: Array<CalendarIndexEvent>,
  eventToAdd: EventFromServer
) {
  if ('date' in eventToAdd.start || 'date' in eventToAdd.end) {
    // We default to have all the All Day Events at the start of the array
    return 0;
  }

  for (const [idx, event] of eventsInDay.entries()) {
    assert(eventToAdd.start != null, "Calendar event doesn't have start");

    // Sort by start time, then end time.
    if (event.startTime == eventToAdd.start) {
      assert(eventToAdd.end != null, "Calendar event doesn't have end");
      if (event.endTime > eventToAdd.end) {
        return idx + 1;
      }
    }
    if (event.startTime > eventToAdd.start) {
      return idx + 1;
    }
  }
  return eventsInDay.length;
}

// TODO kedar: return the events / days in a region of time specified by query
type IndexRange = undefined;
function getEventsInRangeFromIndex(range: IndexRange): Array<CalendarIndexDay> {
  return [];
}

export function splitMultiDayEvent(
  event: EventFromServer
): Array<EventFromServer> {
  const splitEvents: Array<EventFromServer> = [];

  let { start, end, ...eventInfo } = event;

  let startDate = getEventDateTime(event, 'start');
  let endDate = getEventDateTime(event, 'end');

  if (startDate.hasSame(endDate, 'day')) {
    return [event];
  }

  // Create first event start --> midnight
  const endOfDay = startDate.endOf('day');
  splitEvents.push({
    ...eventInfo,
    start,
    end: {
      dateTime: endOfDay.toISO(),
    },
  });

  // Create 24-hr dummy events for days between first and last day of the event
  let previousDay = endOfDay;
  const dayBeforeLastDay = endDate.minus({ days: 1 });

  while (!previousDay.hasSame(dayBeforeLastDay, 'day')) {
    // Create a new day after previousDay
    let today = previousDay.plus({ days: 1 });
    const startOfDay = today.startOf('day');
    const endOfDay = today.endOf('day');

    const newEvent = {
      ...eventInfo,
      start: {
        dateTime: startOfDay.toISO(),
      },
      end: {
        dateTime: endOfDay.toISO(),
      },
    };

    splitEvents.push(newEvent);

    previousDay = today;
  }

  // Create final event for last day from start of day --> end time
  const startOfDay = endDate.startOf('day');
  splitEvents.push({
    ...eventInfo,
    start: {
      dateTime: startOfDay.toISO(),
    },
    end,
  });

  return splitEvents;
}

function getEventDateTime(
  event: EventFromServer,
  startOrEnd: 'start' | 'end'
): DateTime {
  const startOrEndObj = startOrEnd == 'start' ? event.start : event.end;
  if (startOrEndObj.dateTime != null) {
    return DateTime.fromISO(startOrEndObj.dateTime);
  }
  const { date } = startOrEndObj;
  assert(
    date != null,
    `Found event with missing date and dateTime fields: ${event}`
  );
  return DateTime.fromISO(date);
}

function _getFirstDate(eventsByCalendar: {
  [calendarId: string]: {
    events: Array<EventFromServer>;
    accountEmail: string;
  };
}): DateTime {
  const randomCalendarId = Object.keys(eventsByCalendar)[0];
  const randomEvent = eventsByCalendar[randomCalendarId].events[0];
  let firstDate = getEventDateTime(randomEvent, 'start');
  for (const { events: calendarEvents } of Object.values(eventsByCalendar)) {
    for (const event of calendarEvents) {
      const datetime = getEventDateTime(event, 'start');
      if (datetime < firstDate) {
        firstDate = datetime;
      }
    }
  }

  return firstDate;
}

function _initializeEmptyDaysArray(
  firstDate: DateTime
): Array<{ events: Array<CalendarIndexEvent>; date: DateTime }> {
  const days: Array<CalendarIndexDay> = [
    {
      events: [],
      date: firstDate,
    },
  ];
  let previousDate = firstDate;
  for (let i = 1; i < NUM_DAYS; i++) {
    days.push({ events: [], date: previousDate.plus({ days: 1 }) });
    previousDate = days[i].date;
  }

  return days;
}

/**
 * Takes in API response for all event instances (for all event types) combined.
 * Organizes them into an array, indexed by day, starting with Day 0 = today.
 * These events within a day will be sorted by Start time. (Some events may overlap)
 *
 *
 * e.g. [
 *        {
 *          date: Today,
 *          events: [Event (4pm), Event(9pm)]
 *        },
 *        {
 *          date: Tomorrow,
 *          events: [Event(10 am), Event(3pm)]
 *        },
 *        ...,
 *        {
 *          date: Today next year,
 *          events:[...]
 *        }
 *      ]
 * @returns
 */
export function parseCalendarApiResponse(eventsByCalendar: {
  [calendarId: string]: {
    accountEmail: string;
    events: Array<EventFromServer>;
  };
}): CalendarIndex {
  const firstDate = _getFirstDate(eventsByCalendar);
  const days = _initializeEmptyDaysArray(firstDate);

  for (const [
    calendarId,
    { accountEmail, events: allEvents },
  ] of Object.entries(eventsByCalendar)) {
    for (const eventFromServer of allEvents) {
      // Split multi-day events into individual events
      for (const singleDayEventFromServer of splitMultiDayEvent(
        eventFromServer
      )) {
        const eventTime = getEventDateTime(singleDayEventFromServer, 'start');
        const dayIndex = mapDateToIndex(eventTime, days[0].date);

        // Event date is out of bounds for calendar index.
        if (dayIndex == -1) {
          continue;
        }

        const {
          start: startTime,
          end: endTime,
          htmlLink: eventHtmlLink,
          summary,
          id,
        } = singleDayEventFromServer;

        let event: CalendarIndexEvent = {
          startTime,
          endTime,
          color: Color.BLUE,
          eventHtmlLink,
          calendarId,
          summary,
          id: id!,
          accountEmail,
          isAllDayEvent: false,
        };

        const { start: startAsGapiGivesUs, end: endAsGapiGivesUs } =
          singleDayEventFromServer;

        // Check if the field is "date"; if so, this is an all day event, and should be handled accordingly
        if ('date' in startAsGapiGivesUs || 'date' in endAsGapiGivesUs) {
          event.isAllDayEvent = true;
        }

        // Insert at index: _getIndexInDay()
        days[dayIndex].events.splice(
          _getEventIndexInDay(days[dayIndex].events, singleDayEventFromServer),
          0,
          event
        );
      }
    }
  }

  return days;
}

export function _printCalendarIndex(days: Array<CalendarIndexDay>): void {
  console.log(' --- Calendar Index ---');
  console.log('Number of days: ' + days.length + '\n');

  for (const [idx, day] of days.entries()) {
    if (day.events.length > 0) {
      console.log(`Index: ${idx} - Date: ${day.date.toLocaleString()}`);
    }
    for (const event of day.events) {
      console.log(
        `\t${event.summary}: ${DateTime.fromISO(
          event.startTime.dateTime!
        ).toLocaleString(DateTime.DATETIME_MED)}     -     ${DateTime.fromISO(
          event.endTime.dateTime!
        ).toLocaleString(DateTime.DATETIME_MED)}`
      );
    }
  }
}

export function _filterEventInstancesByName(
  events: Array<EventFromServer>,
  name: string
): Array<EventFromServer> {
  return events.filter((event) => event.summary === name);
}
