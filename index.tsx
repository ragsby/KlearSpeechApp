import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Tell TypeScript about the global mixpanel object from the script tag
declare var mixpanel: any;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Initialize Mixpanel
mixpanel.init("b04d9ef851c448521764940adc5b0e3e", {
  debug: true,
  track_pageview: false,
  persistence: "localStorage",
});


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);