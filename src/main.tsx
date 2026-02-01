import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProvider } from './store/AppContext'
import App from './App.tsx'
import 'remixicon/fonts/remixicon.css'
import './index.css'

const StrictMode = (React as any).StrictMode;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)