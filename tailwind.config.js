/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'casa-blue': '#1e40af',
        'casa-green': '#16a34a',
        'casa-red': '#dc2626',
      }
    },
  },
  plugins: [],
}