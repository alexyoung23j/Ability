import React, { useState } from 'react';
import { Auth } from './/auth/auth';
import CommandView from './/command-window/CommandView';
import { CALENDAR_INDEX_1, EVENTS } from '../tests/EventsFixtures';
import SettingsView from './/settings-window/SettingsView';
import { CalendarIndexDay } from './util/command-view-util/CalendarIndexUtil';
import SignIn from './auth/SignIn';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase/db';
import { ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION } from './auth/AuthDAO';
import { ADD_CALENDAR_URL } from '../constants/EnvConstants';
import { shell } from 'electron';
import { GlobalUserSettings } from '../constants/types';
import { loadGlobalSettings } from './util/global-util/GlobalSettingsUtil';

interface AllContextProviderProps {
  showCommand: boolean;
  toggleBetweenWindows: any;
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
  const [isSignedInToFirebase, setSignedInToFirebase] =
    useState<boolean>(false);

  return { isSignedInToFirebase, setSignedInToFirebase };
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
  const { showCommand, toggleBetweenWindows } = props;

  const { isSignedInWithGapi: isSignedIn } = useGapiSignIn();

  // Context State (needed so we can pass the setters to our children to modify context in the app)
  const [calendarIndex, setCalendarIndex] =
    useState<CalendarIndex | null>(CALENDAR_INDEX_1);

  const [electronSessionId, setElectronSessionId] = useState<string | null>(
    generatedElectronSessionId
  );

  const [globalUserSettings, setGlobalUserSettings] =
    useState<GlobalUserSettings>(loadGlobalSettings());

  return (
    <GlobalSettingsContext.Provider
      value={{ globalUserSettings, setGlobalUserSettings }}
    >
      <CalendarContext.Provider value={{ calendarIndex, setCalendarIndex }}>
        <SessionContext.Provider value={electronSessionId}>
          {/*  {(!isSignedIn && <SignIn />) || (
          <button
            onClick={() => {
              shell.openExternal(`${ADD_CALENDAR_URL}/${electronSessionId}`);
            }}
          >
            Add Calendar
          </button>
        )} */}
          {/* <Auth /> */}
          <div>
            {(showCommand && <CommandView />) || (
              <SettingsView toggleWindowHandler={toggleBetweenWindows} />
            )}
          </div>
        </SessionContext.Provider>
      </CalendarContext.Provider>
    </GlobalSettingsContext.Provider>
  );
}
