/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Semua file React
    "../backend/resources/views/**/*.blade.php", // Jika ada blade
    "../backend/resources/js/**/*.{js,jsx,ts,tsx}", // Kalau backend juga punya React/Vue
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {},
  },
  plugins: [],
}
