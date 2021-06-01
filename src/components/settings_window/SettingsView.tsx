import React from 'react'

interface SettingsView {
  toggleWindowHandler: any
}
export default function SettingsView(props: SettingsView) {
  const toggleWindowHandler = props.toggleWindowHandler

  return (
    <div style={{ backgroundColor: 'white', height: "500px"}}>
      Settings Page
      <button onClick={() => toggleWindowHandler('SETTINGS', 'COMMAND')}> Toggle </button>
    </div>
  )
}
