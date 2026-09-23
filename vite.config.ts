import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base: the same build works under GitHub Pages (/ToDoCalendar/)
  // and in Electron, which loads dist/index.html via file://
  base: './',
})
