import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const untitledUiSrc = path.resolve(__dirname, '../../untitled-ui/src');

export default defineConfig(({ mode }) => {
  const surface = mode === 'development' ? 'campaign-details' : mode;
  const surfaceRoot = path.resolve(__dirname, `src/surfaces/${surface}`);
  return {
    root: surfaceRoot,
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        '@': untitledUiSrc,
        '@untitledui/icons': path.resolve(
          __dirname,
          'node_modules/@untitledui/icons'
        ),
      },
    },
    build: {
      outDir: path.resolve(__dirname, `dist/${surface}`),
      emptyOutDir: true,
    },
    server: {
      open: '/',
    },
  };
});
