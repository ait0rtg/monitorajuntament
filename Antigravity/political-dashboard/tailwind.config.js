/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0e14',
        surface: '#161924',
        primary: '#3b82f6',
        urgent: '#ef4444',
        important: '#f59e0b',
        info: '#10b981',
      }
    },
  },
  plugins: [],
}
