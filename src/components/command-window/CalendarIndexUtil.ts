import { calendar_v3 } from 'googleapis';
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
}

// TODO: Change shape to an object that stores the events and any other day-related metadata
// Organized by start time
type Day = { events: Array<Event>; date: Date };

/**
 * Returns number (float) of days in between two given Dates.
 */
function numberOfDaysBetween(day1: Date, day2: Date): number {
  const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
  return (day2.getTime() - day1.getTime()) / ONE_DAY_IN_MILLISECONDS;
}

/**
 * Given a date and a starting date, return what index in an array the date would be assuming the
 * starting date is at index 0, and we increment by 1 per day.
 * @param date
 * @param dateAtIndexZero
 * @returns number - index
 */
function _mapDateToIndex(date: Date, dateAtIndexZero: Date = new Date()) {
  return Math.ceil(numberOfDaysBetween(dateAtIndexZero, date));
}

function _getEventIndexInDay(
  eventsInDay: Array<Event>,
  eventToAdd: calendar_v3.Schema$Event
) {
  for (const [idx, event] of eventsInDay.entries()) {
    assert(eventToAdd.start != null, "Calendar event doesn't have start");
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

// function _addDays(date: Date, days: number): Date {
//   const newDate = new Date();
//   newDate.setDate(date.getDate() + days);
//   return newDate;
// }

function generateDateArray(startDate: Date, numDays: number): Array<Date> {
  const dateArray = new Array();
  let newDate: Date;
  for (let i = 0; i < numDays; i++) {
    newDate = new Date();
    newDate.setDate(startDate.getDate() + i);
    dateArray.push(newDate);
  }
  return dateArray;
}

function datesAreOnSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

// First add start --> midnight
// Then add midnight --> midnight
// Then add midnight --> end

/**
 * @param day yyyy-mm-dd string
 */
function _createDateAtStartOrEndOfDay(
  day: string,
  startOrEnd: 'start' | 'end'
): Date {
  const event = new Date(day);
  if (startOrEnd === 'end') {
    event.setHours(23);
    event.setMinutes(59);
    event.setSeconds(59);
    event.setMilliseconds(999);
  } else {
    event.setHours(0);
    event.setMinutes(0);
    event.setSeconds(0);
    event.setMilliseconds(0);
  }

  return event;
}

function _convertDateToYYYY_MM_DD_string(date: Date): string {
  return date.toISOString().split('T')[0];
}

function splitMultiDayEvent(
  event: calendar_v3.Schema$Event
): Array<calendar_v3.Schema$Event> {
  const splitEvents: Array<calendar_v3.Schema$Event> = [];
  assert(event.start != null, 'Event from server start is null');
  assert(event.end != null, 'Event from server end is null');

  let { start, end, ...eventInfo } = event;

  let startDate = new Date(start.dateTime);
  let endDate = new Date(end.dateTime);
  const timeZone = start.timeZone;

  if (datesAreOnSameDay(startDate, endDate)) {
    return [event];
  }

  // First event start --> midnight
  const endOfDay = _createDateAtStartOrEndOfDay(start.dateTime, 'end');
  splitEvents.push({
    ...eventInfo,
    start,
    end: {
      dateTime: endOfDay.toISOString(),
      timeZone,
    },
  });

  // [first event, middle full event, ]

  // All events in between: midnight --> midnight
  let previousDay = splitEvents[splitEvents.length - 1].end;
  let previousDayDate = new Date(previousDay.dateTime);

  const dayBeforeLastDay = new Date();
  dayBeforeLastDay.setDate(endDate.getDate() - 1);

  while (!datesAreOnSameDay(previousDayDate, dayBeforeLastDay)) {
    const currentDayString = _convertDateToYYYY_MM_DD_string(
      new Date(previousDayDate.getDay() + 1)
    );
    const startOfDay = _createDateAtStartOrEndOfDay(currentDayString, 'start');
    const endOfDay = _createDateAtStartOrEndOfDay(currentDayString, 'end');

    splitEvents.push({
      ...eventInfo,
      start: {
        dateTime: startOfDay.toISOString(),
        timeZone,
      },
      end: {
        dateTime: endOfDay.toISOString(),
        timeZone,
      },
    });

    // TODO kedar: for some reason previousDay is undefined, causing an infinite loop
    previousDay = splitEvents[splitEvents.length - 1].end;
    previousDayDate = new Date(previousDay.dateTime);
  }

  // Add last day --> end of event time
  const startOfDay = _createDateAtStartOrEndOfDay(end.dateTime, 'start');

  splitEvents.push({
    ...eventInfo,
    start: {
      dateTime: startOfDay.toISOString(),
      timeZone,
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
  const days: Array<Day> = generateDateArray(new Date(), NUM_DAYS).map(
    (date) => ({
      date,
      events: [],
    })
  );

  for (const { calendarId, allEvents } of calendarAndEvents) {
    for (const eventFromServerUnsplit of allEvents) {
      for (const eventFromServer of splitMultiDayEvent(
        eventFromServerUnsplit
      )) {
        const eventTime = new Date(eventFromServer.start.dateTime);
        const dayIndex = _mapDateToIndex(eventTime, new Date());

        const event: Event = {
          startTime: eventFromServer.start,
          endTime: eventFromServer.end,
          color: Color.BLUE,
          eventHtmlLink: eventFromServer.htmlLink,
          calendarId,
        };

        // Insert at index: _getIndexInDay()
        days[dayIndex].events.splice(
          _getEventIndexInDay(days[dayIndex].events, eventFromServer),
          0,
          event
        );
      }
    }
  }

  _printCalendarIndex(days);

  return days;
}

export function _printCalendarIndex(days: Array<Day>): void {
  console.log(' --- Calendar Index ---');
  console.log('Number of days: ' + days.length + '\n');
  console.log(`First Day: ${days[0].date.toString()}\n`);
  for (const [idx, day] of days.entries()) {
    if (day.events.length > 0) {
      console.log(`Index: ${idx} - Date: ${day.date.toString()}`);
    }
    for (const event of day.events) {
      console.log(
        `\tEvent Start: ${new Date(event.startTime.dateTime).toString()}`
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

export default {
  parseCalendarApiResponse,
  _getEventIndexInDay,
  numberOfDaysBetween,
  _mapDateToIndex,
  _filterEventInstancesByName,
};
