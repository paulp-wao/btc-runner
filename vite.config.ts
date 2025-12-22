import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/btc-runner/',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'full-reload-on-any-change',
      handleHotUpdate({ server }) {
        server.ws.send({
          type: 'full-reload',
        });
      },
    },
  ],
});
