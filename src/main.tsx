import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'remixicon/fonts/remixicon.css'
import './index.css'

const StrictMode = (React as any).StrictMode;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`).catch(err => console.log('SW fail', err));
    });
  } else if (import.meta.env.DEV) {
    // The cache-first worker would otherwise serve stale dev modules
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
}