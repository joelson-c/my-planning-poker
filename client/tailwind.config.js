import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.tsx",
    "./index.html",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      gridTemplateColumns: {
        'card-list': 'repeat(auto-fill, 100px)',
        'card-list-lg': 'repeat(auto-fill, 115px)',
      }
    },
  },
  plugins: [
    nextui()
  ],
}

