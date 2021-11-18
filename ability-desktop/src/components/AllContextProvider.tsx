import { CalendarIndexDay } from 'components/util/command-view-util/CalendarIndexUtil';
import { loadGlobalSettings } from 'components/util/global-util/GlobalSettingsUtil';
import * as DatabaseUtil from 'firebase/DatabaseUtil';
import React, { useEffect, useState } from 'react';
import { Updater, useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import { AbilityCalendar, GlobalUserSettings } from 'constants/types';
import { isUserSignedIn } from '../firebase/util/FirebaseUtil';
import { CALENDAR_INDEX_1 } from '../tests/EventsFixtures';
import {
  ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION,
  getCalendarInfos,
} from './auth/AuthDAO';
import {
  setGapiClientToken,
  useInitializedGoogleAuthClient,
} from './auth/GoogleAuthSetup';
import SignIn from './auth/SignIn';
import InternalTimeEngine from './internal-time/InternalTimeEngine';
import { loadCalendarData } from './loadCalendarData';
import { useCalendarAPI } from 'hooks/calendar/useCalendarAPI';

interface AllContextProviderProps {
  showCommand: boolean;
  toggleBetweenWindows: any;
  setTrayText: (payload: string) => void;
}

export type CalendarIndex = Array<CalendarIndexDay>;

export interface RegisteredAccountToCalendars {
  [accountEmail: string]: Array<AbilityCalendar>;
}

// -------------------- Context Initializations ----------------- //

// Context that doesn't require setters
const generatedElectronSessionId = uuidv4();

export const SessionContext = React.createContext<string>(
  generatedElectronSessionId
);

export const RegisteredAccountToCalendarsContext = React.createContext<{
  registeredAccountToCalendars: RegisteredAccountToCalendars | null;
  setRegisteredAccountToCalendars: Updater<RegisteredAccountToCalendars> | null;
}>({
  registeredAccountToCalendars: null,
  setRegisteredAccountToCalendars: null,
});

// Context that requires setters
export const CalendarIndexContext =
  React.createContext<{
    calendarIndex: CalendarIndex;
    setCalendarIndex: Updater<CalendarIndex>;
  } | null>(null);

export const GlobalSettingsContext =
  React.createContext<{
    globalUserSettings: GlobalUserSettings;
    setGlobalUserSettings: Updater<GlobalUserSettings>;
  } | null>(null);

export const isCurrentlyFetchingContext =
  React.createContext<{
    isCurrentlyFetching: boolean;
    setIsCurrentlyFetching: Updater<boolean>;
  } | null>(null);

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
  const [calendarIndex, setCalendarIndex] =
    useImmer<CalendarIndex>(CALENDAR_INDEX_1);

  const [electronSessionId, _] = useState<string>(generatedElectronSessionId);

  // TODO: change this to be initialized with null whenever we make loadGlobalSettings async
  const [globalUserSettings, setGlobalUserSettings] =
    useImmer<GlobalUserSettings>(loadGlobalSettings());

  const [registeredAccountToCalendars, setRegisteredAccountToCalendars] =
    useImmer<RegisteredAccountToCalendars | null>(null);

  const [isCurrentlyFetching, setIsCurrentlyFetching] = useState<boolean>(true);

  useEffect(() => {
    if (isSignedIn && authInstance != null) {
      // TODO: We are unable to use our useCalendarAPI Hook because this is not a context consumer. Should we reorg this?
      loadCalendarData(
        ({
          calendarIndex,
          registeredAccountToCalendars,
        }: {
          calendarIndex: CalendarIndex;
          registeredAccountToCalendars: RegisteredAccountToCalendars;
        }) => {
          setCalendarIndex(calendarIndex);
          setRegisteredAccountToCalendars(registeredAccountToCalendars);
        }
      );
      setIsCurrentlyFetching(false);
    }
  }, [isSignedIn]);

  return (
    <GlobalSettingsContext.Provider
      value={{ globalUserSettings, setGlobalUserSettings }}
    >
      <CalendarIndexContext.Provider
        value={{ calendarIndex, setCalendarIndex }}
      >
        <RegisteredAccountToCalendarsContext.Provider
          value={{
            registeredAccountToCalendars,
            setRegisteredAccountToCalendars,
          }}
        >
          <SessionContext.Provider value={electronSessionId}>
            <isCurrentlyFetchingContext.Provider
              value={{ isCurrentlyFetching, setIsCurrentlyFetching }}
            >
              {(!isSignedIn && (
                <SignIn onSignInComplete={() => setIsSignedIn(true)} />
              )) || (
                <InternalTimeEngine
                  showCommand={showCommand}
                  toggleWindowHandler={toggleBetweenWindows}
                  setTrayText={setTrayText}
                />
              )}
            </isCurrentlyFetchingContext.Provider>
          </SessionContext.Provider>
        </RegisteredAccountToCalendarsContext.Provider>
      </CalendarIndexContext.Provider>
    </GlobalSettingsContext.Provider>
  );
}
