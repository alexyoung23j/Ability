import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import CommandView from './components/command-window/CommandView';
import SettingsView from './components/settings-window/SettingsView';
const { ipcRenderer } = require('electron');
const css = require('./index.css');

ipcRenderer.setMaxListeners(Infinity)

// Hack to Add CSS to the DOM. TODO: Fix this if we really need to 
const addStylesString = `<html><head><style>${parseCSS(css)}</style></head></html>`;
document.write(addStylesString)

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


function App() {
  // State
  const [showCommand, setShowCommand] = useState(true)

  /// ---------------- IPC HANDLERS -------------- ///

  // Handle toggling between windows
  const toggleBetweenWindows = (toDisable: string, toEnable: string) => {
    
  };

  // Force Command Line to be Shown
  ipcRenderer.on('show-command', (event, message) => {
    setShowCommand(true)
    ipcRenderer.send('command-showing', [])
  })

  // Force Settings to be Shown
  ipcRenderer.on('show-settings', (event, message) => {
    setShowCommand(false)
    ipcRenderer.send('settings-showing')
  })

  return (
    <div>
      {(showCommand && <CommandView/>) || (<SettingsView toggleWindowHandler={toggleBetweenWindows} />)}
    </div>
  );
}

export default App;
