import { calendar_v3 } from 'googleapis';
import { DateTime } from 'luxon';
import _ from 'underscore';

import { assert } from '../components/util/assert';

// TODO kedar: move these to react_env files and don't store in commit!!!!
const CALENDAR_ID = 'abilityapptester01@gmail.com';

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
 * Return list of all Calendars.
 *
 * Uses the user's token currently set on gapi.client.
 */
export async function getCalendars(): Promise<
  Array<gapi.client.calendar.CalendarListEntry>
> {
  return (
    (await window.gapi.client.calendar.calendarList.list()).result.items ?? []
  );
}

/**
 * Return list of all events for a specific calendar.
 *
 * Uses the user's token currently set on gapi.client.
 */
export async function getCalendarEvents(
  calendarId: string,
  { timeMin, timeMax }: { timeMin?: string; timeMax?: string } = {
    timeMin: DateTime.now().startOf('day').toISO(),
  }
): Promise<Array<EventFromServer>> {
  // TODO: validate these responses and replace the type with Required<...> so we don't have to keep doing `start!.dateTime!` and shit.

  // TODO: Change this to be pagination loop

  return (
    ((
      await window.gapi.client.calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        maxResults: 2500,
      })
    ).result.items as Array<EventFromServer>) ?? []
  );
}
