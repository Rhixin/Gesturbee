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
        titlegray: "#373e50", //text-gray-700
        subtitlegray: '#6B7280', //text-gray-500
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
