//speed style utility class
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: { colors: {
        primary: '#007bff',
        'primary-dark': '#0056b3',
        'light-blue': '#f0f8ff',
        'blue-border': '#cce5ff',
        'blue-light': '#e7f1ff',
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
      }},
  },
  plugins: [],
}