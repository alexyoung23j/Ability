import { calendar_v3 } from 'googleapis';

// TODO: Change shape to an object that stores the events and any other day-related metadata
type Day = Array<calendar_v3.Schema$Event>;

const NUM_DAYS = 365;

function _mapDateToIndex(date: string, dateAtIndexZero: Date = new Date()) {
  var now = new Date();
  var diff = now - dateAtIndexZero;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);

  return 0;
}

function _getIndexInDay(
  eventsInDay: Array<calendar_v3.Schema$Event>,
  eventToAdd: calendar_v3.Schema$Event
) {
  return 0;
}

export function parseCalendarApiResponse(
  rawCalendarInstances: Array<calendar_v3.Schema$Event>
): Array<Day> {
  const days = new Array(NUM_DAYS);
  for (const event of rawCalendarInstances) {
    // TODO - events that go past midnight need to be split into two events (or however many events a multi-day event can be split into)

    const dayIndex = _mapDateToIndex(event.start.dateTime);

    days[dayIndex].splice(_getIndexInDay(days[dayIndex], event), 0, event);
  }

  return days;
}
