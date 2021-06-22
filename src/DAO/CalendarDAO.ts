import { calendar_v3 } from 'googleapis';
import { assert } from '../assert';

// TODO kedar: move these to react_env files and don't store in commit!!!!
const CLIENT_ID =
  '942672633691-1tb2ma14qnkg2so4j4v21opephmmt34o.apps.googleusercontent.com';
const CLIENT_SECRET = 'K_JxXW7e7EFLV0kcJ4ievQCY';

const CALENDAR_ID = 'abilityapptester01@gmail.com';

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
  }: {
    timeMin?: string;
  }
): Promise<calendar_v3.Schema$Events> {
  return (
    await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
    })
  ).data;
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
