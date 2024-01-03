import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        root: './tests',
        setupFiles: './test-boostrap',
        unstubEnvs: true,
        mockReset: true
    },
});
