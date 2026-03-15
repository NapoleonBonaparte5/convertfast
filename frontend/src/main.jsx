import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#f9fafb',
            border: '1px solid #1f2937',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00d4ff', secondary: '#111827' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#111827' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
