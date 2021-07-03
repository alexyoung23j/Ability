import { calendar_v3 } from 'googleapis';
import _ from 'underscore';

import { assert } from '../assert';

// TODO kedar: move these to react_env files and don't store in commit!!!!
const CALENDAR_ID = 'abilityapptester01@gmail.com';

// Default end date string
const END_DATE = new Date('December 10, 2021 12:00:00').toISOString();

export async function fetchRecurringEventInstances(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  eventId: string,
  options: {
    timeMin?: string;
    timeMax?: string;
  }
) {
  const { timeMax, timeMin } = options;
  assert(
    !(timeMax != null && timeMin == null),
    'timeMax cannot be specified without timeMin'
  );
  await calendar.events.instances({
    calendarId,
    eventId,
    timeMin: '2021-06-20T04:30:41.173Z',
    timeMax: '2021-07-20T04:30:41.173Z',
  });
}

export async function fetchEvents(
  calendar: calendar_v3.Calendar,
  {
    timeMin = new Date().toISOString(),
    timeMax,
  }: {
    timeMin?: string;
    timeMax?: string;
  }
): Promise<calendar_v3.Schema$Events> {
  return (
    await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      timeMax: timeMax ?? undefined,
    })
  ).data;
}

export async function fetchInstances(
  calendar: calendar_v3.Calendar,
  options: {
    timeMin?: string;
    timeMax?: string;
  } = {
    // TODO: Change this to be 00:00 of the current day
    timeMin: new Date().toISOString(),
    timeMax: undefined,
  }
) {
  const { timeMin, timeMax } = options;
  const { items } = await fetchEvents(calendar, { timeMin, timeMax });
  const instancesPromises = [];
  for (const item of items) {
    instancesPromises.push(
      calendar.events.instances({
        calendarId: 'abilityapptester01@gmail.com',
        eventId: item['id'],
        timeMin: new Date().toISOString(),
        timeMax: '2021-12-10T20:00:00.000Z',
      })
    );
  }
  const instances = (await Promise.all(instancesPromises)).map(
    (instance) => instance.data.items
  );
  return _.flatten(instances);
}

export async function _fetchSomething(calendar: calendar_v3.Calendar | null) {
  if (calendar != null) {
    assert(
      calendar.context._options?.auth?.credentials != null,
      'Calendar context._options credentials should be set'
    );
    try {
      const out = await calendar.calendarList.list();
      console.log(out);
    } catch (e) {
      console.log(e);
    }
  }
}
