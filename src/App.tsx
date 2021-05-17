import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import CommandView from './components/command_window/CommandView'
import SettingsView from './components/SettingsView'
const { ipcRenderer } = require('electron')



const enum WindowType {
  SETTINGS = 'SETTINGS',
  COMMAND = 'COMMAND',
}

function createNewWindow(
  currentWindowType: WindowType,
  containerEl: HTMLDivElement
) {
  const externalWindow = window.open('', currentWindowType)

  // Append the container div and register the event that will get fired when the
  // window is closed
  if (externalWindow?.document != null) {
    externalWindow.document.body.appendChild(containerEl)
  }

  return externalWindow
}



function App() {
  
  // Spin up new browserwindows (children of main)
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

  // Handle toggling between windows
  const toggleBetweenWindows = (toDisable: string, toEnable: string) => {
    ipcRenderer.send('toggle-event', [toDisable, toEnable])
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
