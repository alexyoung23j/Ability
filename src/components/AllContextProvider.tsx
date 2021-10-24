import React, { useState } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import { GlobalUserSettings } from '../constants/types';
import { db } from '../firebase/db';
import { isUserSignedIn } from '../firebase/util/FirebaseUtil';
import { CALENDAR_INDEX_1 } from '../tests/EventsFixtures';
import { ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION } from './auth/AuthDAO';
import SignIn from './auth/SignIn';
import InternalTimeEngine from './internal-time/InternalTimeEngine';
import { CalendarIndexDay } from './util/command-view-util/CalendarIndexUtil';
import { loadGlobalSettings } from './util/global-util/GlobalSettingsUtil';

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

  db.collection(ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION)
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
  const [isSignedIn, setIsSignedIn] = useState(isUserSignedIn());
  const { showCommand, toggleBetweenWindows, setTrayText } = props;

  // Context State (needed so we can pass the setters to our children to modify context in the app)
  const [calendarIndex, setCalendarIndex] =
    useImmer<CalendarIndex | null>(CALENDAR_INDEX_1);

  const [electronSessionId, _] = useState<string | null>(
    generatedElectronSessionId
  );

  const [globalUserSettings, setGlobalUserSettings] =
    useImmer<GlobalUserSettings>(loadGlobalSettings());

  return (
    <GlobalSettingsContext.Provider
      value={{ globalUserSettings, setGlobalUserSettings }}
    >
      <CalendarContext.Provider value={{ calendarIndex, setCalendarIndex }}>
        <SessionContext.Provider value={electronSessionId}>
          {(!isSignedIn && (
            <SignIn onSignInComplete={() => setIsSignedIn(true)} />
          )) || (
            <InternalTimeEngine
              showCommand={showCommand}
              toggleWindowHandler={toggleBetweenWindows}
              setTrayText={setTrayText}
            />
          )}
        </SessionContext.Provider>
      </CalendarContext.Provider>
    </GlobalSettingsContext.Provider>
  );
}
