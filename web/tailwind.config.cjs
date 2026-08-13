const { createThemes } = require("tw-colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Poppins", "sans-serif"],
    },
    extend: {},
  },
  plugins: [
    createThemes({
      light: {
        text: "#030704",
        background: "#e6ebed",
        primary: "#ffffff",
        secondary: "#a7b7d7",
        accent: "#8981c5",
        danger: "#ff0000",
        success: "#8981c5",
      },
      dark: {
        text: "#e5e7eb",
        background: "#0d1016",
        primary: "#191c21",
        secondary: "#283858",
        accent: "#423a7e",
        danger: "#ff0000",
        success: "#423a7e",
      },
    }),
  ],
};
