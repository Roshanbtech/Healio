import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastContainer } from 'react-toastify'
import AppContextProvider from './context/AppContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContextProvider>
    <App />
    </AppContextProvider>
    <ToastContainer />
  </StrictMode>,
)
