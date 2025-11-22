import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Archivo de arranque principal
const raiz = ReactDOM.createRoot(document.getElementById('root'));

raiz.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

