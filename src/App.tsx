import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import CommandView from './components/command_window/CommandView'
import SettingsView from './components/SettingsView'

const enum WindowType {
  SETTINGS = 'SETTINGS',
  COMMAND = 'COMMAND',
}

function createNewWindow(
  currentWindowType: WindowType,
  onClose: () => void,
  containerEl: HTMLDivElement
) {
  const externalWindow = window.open('', currentWindowType)

  // Append the container div and register the event that will get fired when the
  // window is closed
  if (externalWindow?.document != null) {
    externalWindow.document.body.appendChild(containerEl)
    externalWindow.onunload = onClose
  }

  return externalWindow
}

function App() {
  const [currentWindowType, setCurrentWindowType] = useState<WindowType>(
    WindowType.COMMAND
  )

  const containerEl = document.createElement('div')

  createNewWindow(
    currentWindowType,
    () => {
      setCurrentWindowType(
        currentWindowType === WindowType.SETTINGS
          ? WindowType.COMMAND
          : WindowType.SETTINGS
      )
    },
    containerEl
  )

  console.log(currentWindowType)
  let component: JSX.Element
  switch (currentWindowType) {
    case WindowType.SETTINGS:
      component = <SettingsView />
      break

    case WindowType.COMMAND:
      component = <CommandView />
      break

    default:
      throw new Error('Current Window Type not set.')
  }

  return ReactDOM.createPortal(component, containerEl)
}

export default App
