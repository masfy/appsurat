
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This is a polyfill for Google Apps Script's environment
if (typeof global === 'undefined') {
  (window as any).global = window;
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

// This is a placeholder for the bundled JS file content for GAS deployment.
// In a real project, a bundler (like Vite or Webpack) would generate this file.
// The file 'index.bundle.js' would be created by running 'npm run build'.
// For this example, we assume all TSX files are compiled into one bundle.
