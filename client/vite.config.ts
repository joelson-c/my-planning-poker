import { splitVendorChunkPlugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ tsDecorators: true }), splitVendorChunkPlugin()],
  test: {
    globals: true,
    root: './tests',
    setupFiles: './test-boostrap',
    environment: 'jsdom',
  },
})
