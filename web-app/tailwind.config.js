/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7AA2FF',
        'secondary': '#2A3D75',
        'accent': '#4CAF50',
        'dark': '#0b0f17',
        'darker': '#1e293b',
      },
    },
  },
  plugins: [],
}
