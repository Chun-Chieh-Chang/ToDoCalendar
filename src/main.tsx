import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'remixicon/fonts/remixicon.css'
import './index.css'

const StrictMode = (React as any).StrictMode;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {console.log('ToDoCalendar Loaded: v1.3.0 ' + new Date().toISOString())}
      <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`).catch(err => console.log('SW fail', err));
  });
}