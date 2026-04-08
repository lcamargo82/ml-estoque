/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a951c6',
          dark: '#8a41a3',
        },
        secondary: {
          DEFAULT: '#90699a',
        },
        tertiary: {
          DEFAULT: '#4f3800',
        },
        neutral: {
          DEFAULT: '#7e747d',
        },
        background: '#0f172a', // Deep dark
        surface: '#1e293b',    // Lighter dark
      },
    },
  },
  plugins: [],
}
