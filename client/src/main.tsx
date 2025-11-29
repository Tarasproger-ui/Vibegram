import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider, SocketProvider } from './utils/context';
import { UIProvider } from './utils/uiContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
