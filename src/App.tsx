import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import CommandView from './components/command_window/CommandView'
import SettingsView from './components/SettingsView'
const { ipcRenderer } = require('electron')

// Access to terminal console log
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// CSS for Editor Components defined here... I know this is hilarious 
const stringifiedCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

        .commandLineStyle {
          font-family: 'Montserrat', sans-serif;
          font-size: 24px;
          min-width: 200px;
        }

        .textSnippetStyle {
          font-family: 'Times', sans-serif;
          font-size: 12px;
        }`



const enum WindowType {
  SETTINGS = 'SETTINGS',
  COMMAND = 'COMMAND',
}

function createNewWindow(
  currentWindowType: WindowType,
  containerEl: HTMLDivElement
) {

  const externalWindow = window.open('', currentWindowType)

  // Inject css into new window
  const addStylesString = `<html><head><style>${stringifiedCSS}</style></head></html>`
  externalWindow.document.write(addStylesString)

  // Append the container div 
  if (externalWindow?.document != null) {
    externalWindow.document.body.appendChild(containerEl)
  }

  return externalWindow
}


function App() {
  
  // Spin up new browserwindows (children of sentinel)
  const settingsContainer = document.createElement('div')
  createNewWindow(
    WindowType.SETTINGS,
    settingsContainer
  )
  
  const commandContainer = document.createElement('div')
  createNewWindow(
    WindowType.COMMAND,
    commandContainer
  )

  /// ---------------- IPC HANDLERS -------------- ///

  ipcRenderer.on('clear-command-line', () => {
    console.log("cleared")
  })

  // Handle toggling between windows
  const toggleBetweenWindows = (toDisable: string, toEnable: string) => {
    ipcRenderer.send('toggle-event', [toDisable, toEnable])
    setTimeout(() => {
      ipcRenderer.send('resolve-toggle-event', [])
    }, 400)
  }


 
  let SettingsViewComponent = <SettingsView 
                                  toggleWindowHandler={toggleBetweenWindows}
                              />

  let CommandViewComponent = <CommandView />

  return (
    <div>
      {ReactDOM.createPortal(SettingsViewComponent, settingsContainer)}
      {ReactDOM.createPortal(CommandViewComponent, commandContainer)}
    </div>
  )
}

export default App
