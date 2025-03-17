import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Get the root element
const rootElement = document.getElementById('root');

// Check if dark mode is enabled in localStorage
const userPreferences = localStorage.getItem('currency_converter_preferences');
const darkModeEnabled = userPreferences 
  ? JSON.parse(userPreferences).darkMode 
  : false;

// Apply dark mode class to html element if enabled
if (darkModeEnabled) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Create root and render app
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
