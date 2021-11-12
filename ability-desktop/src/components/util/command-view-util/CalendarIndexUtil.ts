import { EventFromServer } from 'DAO/CalendarDAO';
import produce from 'immer';
import { DateTime } from 'luxon';
import { ScriptElementKindModifier } from 'typescript';
import { CalendarIndex } from '../../../components/AllContextProvider';

import { assert } from '../assert';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const NUM_DAYS = Math.ceil(365 / 2) + 365;

export const enum Color {
  BLUE = 'BLUE',
}

function eventComparator(
  event1: CalendarIndexEvent,
  event2: CalendarIndexEvent
): -1 | 0 | 1 {
  const getDateTime = (time: gapi.client.calendar.EventDateTime) =>
    time.dateTime ?? time.date!;

  if (event1.isAllDayEvent || event2.isAllDayEvent) {
    if (event1.isAllDayEvent && event2.isAllDayEvent) {
      return 0;
    } else if (event1.isAllDayEvent) {
      return -1;
    }
    return 1;
  }
  const event1Start = DateTime.fromISO(getDateTime(event1.startTime));
  const event2Start = DateTime.fromISO(getDateTime(event2.startTime));
  const event1End = DateTime.fromISO(getDateTime(event1.endTime));
  const event2End = DateTime.fromISO(getDateTime(event2.endTime));

  // Compare start times
  if (event1Start < event2Start) {
    return -1;
  } else if (event1Start > event2Start) {
    return 1;
  }
  // Compare end times
  if (event1End < event2End) {
    return -1;
  } else if (event1End > event2End) {
    return 1;
  }
  return 0;
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

// TODO: see if there's a better way to identify whether an event is all day
function isAllDayEvent(event: EventFromServer): boolean {
  return event.start.date != null || event.end.date != null;
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
          isAllDayEvent: isAllDayEvent(singleDayEventFromServer),
        };

        // Insert event at respective dayIndex
        days[dayIndex].events.push(event);
      }
    }
  }
  // TODO: check if this is performant for a lot of events
  const sortedDays = produce(days, (draftDays) => {
    for (const [dayIdx, { events }] of draftDays.entries()) {
      draftDays[dayIdx].events = events.sort(eventComparator);
    }
  });

  return sortedDays;
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
