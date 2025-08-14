import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for environments that might need it.
if (typeof global === 'undefined') {
  window.global = window;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
