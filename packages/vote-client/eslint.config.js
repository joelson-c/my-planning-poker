import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ...reactPlugin.configs.flat.recommended,
        ...reactPlugin.configs.flat['jsx-runtime'],
    },
    ...compat.extends('plugin:react-hooks/recommended'),
    {
        ignores: ['build/', '.react-router/', 'tests/'],
    },
    jsxA11y.flatConfigs.recommended,
];
