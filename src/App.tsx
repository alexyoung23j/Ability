import React, { useState } from 'react';
import { Auth } from './components/auth/auth';
import CommandView from './components/command-window/CommandView';
import { CALENDAR_INDEX_1, EVENTS } from './tests/EventsFixtures';
import SettingsView from './components/settings-window/SettingsView';
const { ipcRenderer } = require('electron');
const css = require('./styles/index.css');

import { config } from 'dotenv';
import { CalendarIndexDay } from './components/util/command-view-util/CalendarIndexUtil';
import AllContextProvider from './components/AllContextProvider';
import SignIn from './components/auth/SignIn';
import { subscribe } from './firebase/db';
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

// App will handle the interactions with Electron. All context and component logic starts inside AllContextProvider
function App() {
  // State
  const { isSignedInToFirebase } = useFirebaseSignIn();
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
  return <Auth />;
  // return (
  //   (!isSignedInToFirebase && <SignIn />) || (
  //     <AllContextProvider
  //       showCommand={showCommand}
  //       toggleBetweenWindows={toggleBetweenWindows}
  //     />
  //   )
  // );
}

export default App;
