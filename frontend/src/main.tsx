import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AppContextProvider from './context/AppContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </SocketProvider>
  </StrictMode>,
);
