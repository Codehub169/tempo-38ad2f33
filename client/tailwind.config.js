/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#007BFF',       // Bright Blue
        'secondary': '#F8F9FA',     // Light Gray
        'accent': '#28A745',        // Success Green
        'text-dark': '#212529',
        'text-light': '#6C757D',
        'border-color': '#DEE2E6',
        'danger': '#DC3545',
        'warning': '#FFC107',
        'success': '#28A745' // Same as accent
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        secondary: ['Poppins', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
        },
      }
    },
  },
  plugins: [],
}
