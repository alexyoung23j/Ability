import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

function render() {
  ReactDOM.render(
    <React.StrictMode>
        <App />    
    </React.StrictMode>,
    document.body
  );
}

render()
