import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AppContextProvider from './context/AppContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { Buffer } from 'buffer';
if (!window.Buffer) window.Buffer = Buffer;
if (!window.global) window.global = window.globalThis;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </SocketProvider>
  </StrictMode>,
);
