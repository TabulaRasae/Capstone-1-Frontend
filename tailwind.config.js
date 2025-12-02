/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', '"Inter"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce7ff",
          200: "#c2d4ff",
          300: "#9db8ff",
          400: "#7297ff",
          500: "#4b7bff",
          600: "#2f5ef7",
          700: "#244ad6",
          800: "#1c39aa",
          900: "#172f87",
        },
        accent: {
          50: "#f1fdf8",
          100: "#d5f5e8",
          200: "#ade9d5",
          300: "#7ad9bd",
          400: "#43c7a2",
          500: "#18b48c",
          600: "#0f9f7a",
          700: "#0b8264",
          800: "#07654f",
          900: "#054d3d",
        },
        ink: {
          50: "#f8fafc",
          100: "#eef2f7",
          200: "#e1e7ef",
          300: "#cdd6e4",
          400: "#9fafc3",
          500: "#71809a",
          600: "#4b5775",
          700: "#34405c",
          800: "#1d2741",
          900: "#0f172a",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
