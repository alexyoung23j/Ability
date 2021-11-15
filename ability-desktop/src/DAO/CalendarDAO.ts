import { DateTime } from 'luxon';
import _ from 'underscore';

import { fetchPaginated } from 'DAO/GapiDaoUtil';

// Default end date string
const END_DATE = new Date('December 10, 2021 12:00:00').toISOString();

export type EventFromServer = gapi.client.calendar.Event & {
  start: { dateTime: string } | { date: string };
  end: { dateTime: string } | { date: string };
  id: string;
  htmlLink: string;
  summary: string;
};

/**
 * Return list of all Calendars for the current gapi user.
 */
export async function getCalendars(): Promise<
  Array<gapi.client.calendar.CalendarListEntry>
> {
  const params = {};
  return fetchPaginated<gapi.client.calendar.CalendarListEntry>(
    params,
    (args) => window.gapi.client.calendar.calendarList.list(args)
  );
}

/**
 * Return list of all events for a specific calendar for the current gapi user.
 *
 * Unless specified, fetches all events from today --> 1 year from today.
 */
export async function getCalendarEvents(
  calendarId: string,
  { timeMin, timeMax }: { timeMin?: string; timeMax?: string } = {
    timeMin: DateTime.now().minus({ days: 7 }).startOf('day').toISO(),
    timeMax: DateTime.now().plus({ years: 1 }).endOf('day').toISO(),
  }
): Promise<Array<EventFromServer>> {
  type FetchCalendarEventsParams = {
    calendarId: string;
    timeMin?: string;
    timeMax?: string;
    singleEvents: boolean;
    maxResults: number;
  };

  const fetchFn = (
    args: FetchCalendarEventsParams
  ): gapi.client.Request<gapi.client.calendar.Events> =>
    window.gapi.client.calendar.events.list(args);

  const events = await fetchPaginated<
    gapi.client.calendar.Event,
    FetchCalendarEventsParams
  >(
    { calendarId, timeMin, timeMax, singleEvents: true, maxResults: 2500 },
    fetchFn
  );
  // Pretty certain that these fields are always there.
  // TODO: validate that this^ is true...
  return events as Array<EventFromServer>;
}
