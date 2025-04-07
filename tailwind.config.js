/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00BFAF", // katong grayish
        secondary: "#FBBC05", //yellow bee color
        tertiary: "#104846", // same sa primary but darker
        titlegray: "#373e50", //text-gray-700
        subtitlegray: "#6B7280", //text-gray-500
        placeholder: "#888", //text input placeholder
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
