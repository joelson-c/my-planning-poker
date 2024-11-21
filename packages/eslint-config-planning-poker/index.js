/** @type {import('eslint').Linter.Config} */
module.exports = {
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
    },
    ignorePatterns: ['!**/.server', '!**/.client'],

    // Base config
    extends: ['eslint:recommended'],

    overrides: [
        // React
        {
            files: ['**/*.{js,jsx,ts,tsx}'],
            plugins: ['react', 'jsx-a11y'],
            extends: [
                'plugin:react/recommended',
                'plugin:react/jsx-runtime',
                'plugin:react-hooks/recommended',
                'plugin:jsx-a11y/recommended',
            ],
            settings: {
                react: {
                    version: 'detect',
                },
                formComponents: ['Form'],
                linkComponents: [
                    { name: 'Link', linkAttribute: 'to' },
                    { name: 'NavLink', linkAttribute: 'to' },
                ],
                'import/resolver': {
                    typescript: {},
                },
            },
        },

        // Typescript
        {
            files: ['**/*.{ts,tsx}'],
            plugins: ['@typescript-eslint'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: true,
            },
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:rxjs/recommended',
            ],
        },

        // Node
        {
            files: ['.eslintrc.cjs', '.eslintrc.js'],
            env: {
                node: true,
            },
        },
    ],
    rules: {
        'react/prop-types': [2, { ignore: ['className'] }],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
    },
};
