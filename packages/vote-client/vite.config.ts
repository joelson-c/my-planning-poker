import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

export default defineConfig(({ isSsrBuild }) => ({
    build: {
        target: 'esnext',
        rollupOptions: isSsrBuild
            ? {
                  input: './server/app.ts',
              }
            : undefined,
    },
    css: {
        postcss: {
            plugins: [tailwindcss, autoprefixer],
        },
    },
    plugins: [
        /* devServer({ entry: './server/app.ts', adapter }), */
        reactRouter(),
        tsconfigPaths(),
    ],
}));
