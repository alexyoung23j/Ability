import React, { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import { GlobalUserSettings } from '../constants/types';
import { isUserSignedIn } from '../firebase/util/FirebaseUtil';
import { CALENDAR_INDEX_1 } from '../tests/EventsFixtures';
import {
  ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION,
  getCalendarInfos,
} from './auth/AuthDAO';
import SignIn, { CalendarInfo } from './auth/SignIn';
import InternalTimeEngine from './internal-time/InternalTimeEngine';
import {
  EventFromServer,
  getCalendarEvents,
  getCalendars,
} from 'DAO/CalendarDAO';

import * as DatabaseUtil from 'firebase/DatabaseUtil';

import {
  CalendarIndexDay,
  parseCalendarApiResponse,
} from 'components/util/command-view-util/CalendarIndexUtil';
import { loadGlobalSettings } from 'components/util/global-util/GlobalSettingsUtil';
import {
  setGapiClientToken,
  useInitializedGoogleAuthClient,
} from './auth/GoogleAuthSetup';

interface AllContextProviderProps {
  showCommand: boolean;
  toggleBetweenWindows: any;
  setTrayText: (payload: string) => void;
}

export type CalendarIndex = Array<CalendarIndexDay>;

// -------------------- Context Initializations ----------------- //

// Context that doesn't require setters
const generatedElectronSessionId = uuidv4();

export const SessionContext = React.createContext<string>(
  generatedElectronSessionId
);

// Context that requires setters
export const CalendarContext = React.createContext(null);

export const GlobalSettingsContext = React.createContext(null);

// ---------------- Methods that should be elsewhere/are temp -------- //
export function useFirebaseSignIn() {
  const [isSignedInToFirebase, setIsSignedInToFirebase] =
    useState<boolean>(false);

  return { isSignedInToFirebase, setIsSignedInToFirebase };
}

export function useGapiSignIn() {
  const [isSignedInWithGapi, setIsSignedInWithGapi] = useState<boolean>(false);

  DatabaseUtil.database
    .collection(ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION)
    .doc(generatedElectronSessionId)
    .onSnapshot((doc) => {
      // console.log('session id:', generatedElectronSessionId);
      // console.log(doc.data());
      if (doc.data() != null) {
        setIsSignedInWithGapi(true);
      }
    });

  return { isSignedInWithGapi, setIsSignedInWithGapi };
}

async function loadCalendarData(
  storeCalendarIndex: (calendarIndex: Array<CalendarIndexDay>) => void
) {
  console.log('Fetching calendar data');
  // Get current user from firebase
  const userCalendarInfos = await getCalendarInfos();
  const allEventsByCalendar: {
    [calendarId: string]: Array<EventFromServer>;
  } = {};

  for (const calendarInfo of userCalendarInfos) {
    const {
      calendarAccessInfo: { accessToken },
    } = calendarInfo;

    // Set token per calendar
    setGapiClientToken(accessToken);
    const calendars = await getCalendars();
    for (const calendar of calendars) {
      // TODO: We need to pull out individual events, and only for the desired range.
      const events = await getCalendarEvents(calendar.id!);
      allEventsByCalendar[calendar.id!] = events;
    }
  }

  const calendarIndex = parseCalendarApiResponse(allEventsByCalendar);

  storeCalendarIndex(calendarIndex);
}

/**
 * AllContextProvider provides all rendered components with access to various pieces of context state
 * It does not interact with the main electron process or window switching. This is the highest level component
 * for which it is appropriate to store any and all context.
 * @param props
 */
export default function AllContextProvider(props: AllContextProviderProps) {
  const { authInstance } = useInitializedGoogleAuthClient();
  const [isSignedIn, setIsSignedIn] = useState(isUserSignedIn());
  const { showCommand, toggleBetweenWindows, setTrayText } = props;

  // Context State (needed so we can pass the setters to our children to modify context in the app)
  const [calendarIndex, setCalendarIndex] = useImmer<CalendarIndex | null>(
    CALENDAR_INDEX_1
  );

  const [electronSessionId, _] = useState<string | null>(
    generatedElectronSessionId
  );

  const [globalUserSettings, setGlobalUserSettings] =
    useImmer<GlobalUserSettings>(loadGlobalSettings());

  useEffect(() => {
    if (isSignedIn && authInstance != null) {
      loadCalendarData(setCalendarIndex);
    }
  }, [isSignedIn]);

  return (
    <GlobalSettingsContext.Provider
      value={{ globalUserSettings, setGlobalUserSettings }}
    >
      <CalendarContext.Provider value={{ calendarIndex, setCalendarIndex }}>
        <SessionContext.Provider value={electronSessionId}>
          {/*  {(!isSignedIn && (
            <SignIn onSignInComplete={() => setIsSignedIn(true)} />
          )) || (
            <>
              <button
                onClick={async () => {
                  await firebase.auth().signOut();
                  setIsSignedIn(false);
                }}
              >
                Sign out
              </button> */}
          <InternalTimeEngine
            showCommand={showCommand}
            toggleWindowHandler={toggleBetweenWindows}
            setTrayText={setTrayText}
          />
        </SessionContext.Provider>
      </CalendarContext.Provider>
    </GlobalSettingsContext.Provider>
  );
}
