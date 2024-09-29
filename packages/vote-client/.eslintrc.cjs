/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@planningpoker/planning-poker"],
  overrides: [
    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
      },
      extends: ["plugin:@typescript-eslint/recommended"],
    },
  ],
};
