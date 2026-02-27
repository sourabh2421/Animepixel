/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cr-orange': '#F47521',
        'cr-dark': '#1A1A1A',
      },
    },
  },
  plugins: [],
}
