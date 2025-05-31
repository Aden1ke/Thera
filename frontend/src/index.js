import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './components/theme-provider'; // Your custom React theme provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ThemeProvider wraps App, making theme context available to all components within App */}
    <ThemeProvider defaultTheme="light" storageKey="my-app-theme"> {/* Using 'my-app-theme' as example storageKey */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
