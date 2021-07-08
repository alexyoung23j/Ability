import { calendar_v3 } from 'googleapis';
import { DateTime } from 'luxon';

import { assert } from '../../assert';

const NUM_DAYS = 365;

const enum Color {
  BLUE = 'BLUE',
}

interface Event {
  startTime: calendar_v3.Schema$EventDateTime;
  endTime: calendar_v3.Schema$EventDateTime;
  // map color Id --> unique color that hasn't been used yet
  color: Color;
  eventHtmlLink: string | null;
  calendarId: string;
  summary: string;
}

// Organized by start time
type Day = { events: Array<Event>; date: DateTime };

/**
 * Given a date and a starting date, return what index in an array the date would be assuming the
 * starting date is at index 0, and we increment by 1 per day.
 * @param date
 * @param dateAtIndexZero
 * @returns number: index
 */
export function _mapDateToIndex(
  date: DateTime,
  dateAtIndexZero: DateTime = DateTime.now()
): number {
  const normalizedDate = date.startOf('day');
  const normalizedStart = dateAtIndexZero.startOf('day');
  const { days: diff } = normalizedDate.diff(normalizedStart, 'day').toObject();
  assert(
    diff < NUM_DAYS,
    `Date is too far out from index 0 date: ${date.toISO()}`
  );
  return diff;
}

function _getEventIndexInDay(
  eventsInDay: Array<Event>,
  eventToAdd: calendar_v3.Schema$Event
) {
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
function getEventsInRangeFromIndex(range: IndexRange): Array<Day> {
  return [];
}

export function splitMultiDayEvent(
  event: calendar_v3.Schema$Event
): Array<calendar_v3.Schema$Event> {
  const splitEvents: Array<calendar_v3.Schema$Event> = [];
  assert(event.start != null, 'Event from server start is null');
  assert(event.end != null, 'Event from server end is null');

  let { start, end, ...eventInfo } = event;

  let startDate = DateTime.fromISO(start.dateTime);
  let endDate = DateTime.fromISO(end.dateTime);

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

  // Create dummy events that last all day for days between first and last day of the event
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

/**
 * Takes in API response for all event instances (for all event types) combined.
 * Organizes them into an array, indexed by day, starting with Day 0 = today.
 * These events within a day will be sorted by Start time. (Some events may overlap)
 *
 * NOTE: First day in index will ALWAYS be today (DateTime.now()).
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
export function parseCalendarApiResponse(
  calendarAndEvents: Array<{
    calendarId: string;
    allEvents: Array<calendar_v3.Schema$Event>;
  }>
): Array<Day> {
  // Initialize Days
  const days: Array<Day> = [
    { events: [], date: DateTime.now().startOf('day') },
  ];
  let previousDate = days[0].date;
  for (let i = 1; i < NUM_DAYS; i++) {
    days.push({ events: [], date: previousDate.plus({ days: 1 }) });
    previousDate = days[i].date;
  }

  for (const { calendarId, allEvents } of calendarAndEvents) {
    for (const eventFromServer of allEvents) {
      // Split multi-day events into individual events
      for (const singleDayEventFromServer of splitMultiDayEvent(
        eventFromServer
      )) {
        const eventTime = DateTime.fromISO(
          singleDayEventFromServer.start.dateTime
        );
        const dayIndex = _mapDateToIndex(eventTime);

        const event: Event = {
          startTime: singleDayEventFromServer.start,
          endTime: singleDayEventFromServer.end,
          color: Color.BLUE,
          eventHtmlLink: singleDayEventFromServer.htmlLink,
          calendarId,
          summary: singleDayEventFromServer.summary,
        };

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

export function _printCalendarIndex(days: Array<Day>): void {
  console.log(' --- Calendar Index ---');
  console.log('Number of days: ' + days.length + '\n');

  for (const [idx, day] of days.entries()) {
    if (day.events.length > 0) {
      console.log(`Index: ${idx} - Date: ${day.date.toLocaleString()}`);
    }
    for (const event of day.events) {
      console.log(
        `\t${event.summary}: ${DateTime.fromISO(
          event.startTime.dateTime
        ).toLocaleString(DateTime.DATETIME_MED)}     -     ${DateTime.fromISO(
          event.endTime.dateTime
        ).toLocaleString(DateTime.DATETIME_MED)}`
      );
    }
  }
}

export function _filterEventInstancesByName(
  events: Array<calendar_v3.Schema$Event>,
  name: string
): Array<calendar_v3.Schema$Event> {
  return events.filter((event) => event.summary === name);
}
