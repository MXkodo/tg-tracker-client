/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        "custom-yellow": "rgb(215, 178, 107)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
