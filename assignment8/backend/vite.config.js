import {defineConfig} from 'vitest/config';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint(),
  ],
  test: {
    environment: 'node',
    env: {NODE_ENV: 'test'},
    coverage: {
      include: [
        'src/**',
        'test/**',
      ],
      exclude: [
        'src/server.js',
      ],
    },
  },
});
