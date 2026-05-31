import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: GitHub Pages가 /focus-timer/ 하위 경로에 배포되므로 필요
export default defineConfig({
  base: '/focus-timer/',
  plugins: [react()],
})
