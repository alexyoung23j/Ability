import React from 'react'
const { ipcRenderer } = require('electron');


interface SettingsView {
  toggleWindowHandler: any
}
export default function SettingsView(props: SettingsView) {
  const toggleWindowHandler = props.toggleWindowHandler

  return (
    <div className="titlebar" style={{ backgroundColor: 'white', height: "500px"}}>
      Settings Page
      <button onClick={() => toggleWindowHandler('SETTINGS', 'COMMAND')}> Toggle </button>
      <button onClick={() => {ipcRenderer.send('close-settings', [])}}> Close </button>
    </div>
  )
}
