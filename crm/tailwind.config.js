/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        athena: {
          dark: '#020617',
          card: '#0f172a',
          border: '#1e293b',
          amber: '#f59e0b',
          gold: '#d97706',
          blue: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
