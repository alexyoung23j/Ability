import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
//import './index.css'

import './css/EditorComponent.css'


function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

render()
