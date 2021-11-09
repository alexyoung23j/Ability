import { AbilityCalendar } from 'constants/types';
import {
  EventFromServer,
  getCalendarEvents,
  getCalendars,
} from 'DAO/CalendarDAO';
import {
  CalendarIndex,
  RegisteredAccountToCalendars,
} from './AllContextProvider';
import { getCalendarInfos } from './auth/AuthDAO';
import { setGapiClientToken } from './auth/GoogleAuthSetup';
import {
  Color,
  parseCalendarApiResponse,
} from './util/command-view-util/CalendarIndexUtil';

function transformCalendarFromServerToAbilityCalendar(
  calendar: gapi.client.calendar.CalendarListEntry,
  accountEmail: string
): AbilityCalendar {
  return {
    name: calendar.summary!,
    accountEmail,
    color: Color.BLUE,
    calendarId: calendar.id!,
  };
}
// TODO: add fuckin types
function _storeInMap(map, key, value): void {
  if (map.hasOwnProperty(key)) {
    map[key].push(value);
  } else {
    map[key] = [value];
  }
}

export async function loadCalendarData(
  storeCalendarData: ({
    calendarIndex,
    registeredAccountToCalendars,
  }: {
    calendarIndex: CalendarIndex;
    registeredAccountToCalendars: RegisteredAccountToCalendars;
  }) => void
) {
  //  console.log('Fetching calendar data');
  // Get current user from firebase
  const userCalendarInfos = await getCalendarInfos();
  const allEventsByCalendar: {
    [calendarId: string]: {
      accountEmail: string;
      events: Array<EventFromServer>;
    };
  } = {};

  const registeredAccountToCalendars: RegisteredAccountToCalendars = {};

  for (const calendarInfo of userCalendarInfos) {
    const {
      calendarAccessInfo: { accessToken },
      // TODO: change this field to be called accountEmail in `CalendarInfo` and therefore, in the DB as well.
      calendarId: accountEmail,
    } = calendarInfo;

    // Set token per calendar
    setGapiClientToken(accessToken);
    const calendars = await getCalendars();

    for (const calendarFromServer of calendars) {
      //console.log('calendar:', calendarFromServer);
      const abilityCalendar = transformCalendarFromServerToAbilityCalendar(
        calendarFromServer,
        accountEmail
      );
      _storeInMap(registeredAccountToCalendars, accountEmail, abilityCalendar);

      const events = await getCalendarEvents(calendarFromServer.id!);
      allEventsByCalendar[calendarFromServer.id!] = { events, accountEmail };
    }
  }

  const parsedCalendarIndex = parseCalendarApiResponse(allEventsByCalendar);

  storeCalendarData({
    calendarIndex: parsedCalendarIndex,
    registeredAccountToCalendars,
  });
}
