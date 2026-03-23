/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        gastromond: ["Gastromond-Italic"],
        roboto: ["RobotoSerif-Regular"],
        robotoSemibold: ["RobotoSerif-SemiBold"]
      },
      colors: {
        background: '#fdfbf7'
      }
    },
  },
  plugins: [],
}