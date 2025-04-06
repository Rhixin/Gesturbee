/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00BFAF",
        secondary: "#FBBC05",
        tertiary: "#104846",
      },
      fontFamily: {
        poppins: ["Poppins"],
        "poppins-medium": ["Poppins-Medium"],
        "poppins-bold": ["Poppins-Bold"],
      },
    },
  },
  plugins: [],
};
