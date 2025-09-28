/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./Pages/**/*.{js,ts,jsx,tsx}",
    "./Components/**/*.{js,ts,jsx,tsx}",
    "./Entities/**/*.{js,ts,jsx,tsx}",
    "./*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}