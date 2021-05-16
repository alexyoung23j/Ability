import React from 'react'
import CommandView from './components/command_window/CommandView'
import electron from 'electron'
const remote = electron.remote

function App() {
  // return <CommandView />
  return (
    <button
      style={{ width: '100px', height: '100px' }}
      onClick={() => {
        const window = remote.getCurrentWindow()
        window.setSize(200, 1000)
      }}
    ></button>
  )
}

export default App
