import React, { useState } from 'react';
const { ipcRenderer } = require('electron');
const css = require('./styles/index.css');

import { config } from 'dotenv';
import SignIn from './components/auth/SignIn';
import { db } from './firebase/db';
import { ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION } from './components/auth/AuthDAO';
import { v4 as uuidv4 } from 'uuid';
import { shell } from 'electron';
import { ADD_CALENDAR_URL } from './constants/EnvConstants';
config();

ipcRenderer.setMaxListeners(Infinity);

// Hack to Add CSS to the DOM. TODO: Fix this if we really need to
const addStylesString = `<html><head><style>${parseCSS(
  css
)}</style></head></html>`;
document.write(addStylesString);

// Access to terminal console log
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// Converts our CSS import into a string to be injected into the window
function parseCSS(css: any): String {
  let cssString = '';
  const stringyCSS = JSON.stringify(css);
  const parsedCSS = JSON.parse(stringyCSS);
  const numImports = parsedCSS.default.length;

  // Add import statements
  for (var i = 0; i < numImports - 1; i++) {
    cssString += parsedCSS.default[i][1];
  }

  // Add classes
  cssString += parsedCSS.default[numImports - 1][1];

  return cssString;
}

export function useFirebaseSignIn() {
  const [isSignedInToFirebase, setSignedInToFirebase] =
    useState<boolean>(false);

  return { isSignedInToFirebase, setSignedInToFirebase };
}

const sessionId = uuidv4();
export const SessionContext = React.createContext<string>(sessionId);

export function useGapiSignIn() {
  const [isSignedInWithGapi, setIsSignedInWithGapi] = useState<boolean>(false);

  db.collection(ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION)
    .doc(sessionId)
    .onSnapshot((doc) => {
      console.log('session id:', sessionId);
      console.log(doc.data());
      if (doc.data() != null) {
        setIsSignedInWithGapi(true);
      }
    });

  return { isSignedInWithGapi, setIsSignedInWithGapi };
}

// App will handle the interactions with Electron. All context and component logic starts inside AllContextProvider
function App() {
  // State
  // const { isSignedInToFirebase } = useFirebaseSignIn();
  const { isSignedInWithGapi: isSignedIn } = useGapiSignIn();
  const [showCommand, setShowCommand] = useState(true);

  /// ---------------- IPC HANDLERS -------------- ///

  // Handle toggling between windows
  const toggleBetweenWindows = (toDisable: string, toEnable: string) => {};

  // Force Command Line to be Shown
  ipcRenderer.on('show-command', (event, message) => {
    setShowCommand(true);
    ipcRenderer.send('command-showing', []);
  });

  // Force Settings to be Shown
  ipcRenderer.on('show-settings', (event, message) => {
    setShowCommand(false);
    ipcRenderer.send('settings-showing');
  });
  // return <Auth />;
  return (
    <SessionContext.Provider value={sessionId}>
      {(!isSignedIn && <SignIn />) || (
        <button
          onClick={() => {
            shell.openExternal(`${ADD_CALENDAR_URL}/${sessionId}`);
          }}
        >
          Add Calendar
        </button>
        // <AllContextProvider
        //   showCommand={showCommand}
        //   toggleBetweenWindows={toggleBetweenWindows}
        // />
      )}
    </SessionContext.Provider>
  );
}

export default App;
