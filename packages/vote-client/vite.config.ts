/// <reference types="vitest/config" />

import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
    test: {
        include: ['app/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    },
});
