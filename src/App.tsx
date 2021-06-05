import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import CommandView from './components/command-window/CommandView';
import SettingsView from './components/settings-window/SettingsView';
const { ipcRenderer } = require('electron');
const css = require('./index.css');

// Access to terminal console log
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const enum WindowType {
  SETTINGS = 'SETTINGS',
  COMMAND = 'COMMAND',
}

// Converts our CSS import into a string to be injected into the new windows
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

// Creates new windows
function createNewWindow(
  currentWindowType: WindowType,
  containerEl: HTMLDivElement
) {
  const externalWindow = window.open('', currentWindowType);

  // Inject css into new window
  const addStylesString = `<html><head><style>${parseCSS(
    css
  )}</style></head></html>`;
  externalWindow.document.write(addStylesString);

  // Append the container div
  if (externalWindow?.document != null) {
    externalWindow.document.body.appendChild(containerEl);
  }

  return externalWindow;
}

function App() {
  // Spin up new browserwindows (children of sentinel)
  const settingsContainer = document.createElement('div');
  createNewWindow(WindowType.SETTINGS, settingsContainer);

  const commandContainer = document.createElement('div');
  createNewWindow(WindowType.COMMAND, commandContainer);

  /// ---------------- IPC HANDLERS -------------- ///

  ipcRenderer.on('clear-command-line', () => {
    console.log('cleared');
  });

  // Handle toggling between windows
  const toggleBetweenWindows = (toDisable: string, toEnable: string) => {
    ipcRenderer.send('toggle-event', [toDisable, toEnable]);
    setTimeout(() => {
      ipcRenderer.send('resolve-toggle-event', []);
    }, 400);
  };

  let SettingsViewComponent = (
    <SettingsView toggleWindowHandler={toggleBetweenWindows} />
  );

  let CommandViewComponent = <CommandView />;

  return (
    <div>
      {ReactDOM.createPortal(SettingsViewComponent, settingsContainer)}
      {ReactDOM.createPortal(CommandViewComponent, commandContainer)}
    </div>
  );
}

export default App;
