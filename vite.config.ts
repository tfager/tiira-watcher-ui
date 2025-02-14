import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), commonjs()],
  envPrefix: 'REACT_APP_',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest-setup.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*'],
      exclude: [],
    }
  }
})

