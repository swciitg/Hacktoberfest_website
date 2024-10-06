/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'mobile': '480px', // Custom mobile breakpoint at 480px
      },
    },
  },
  plugins: [],
}
