import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // package.json is the single source of truth for the app version
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Relative base: the same build works under GitHub Pages (/ToDoCalendar/)
  // and in Electron, which loads dist/index.html via file://
  base: './',
})
