/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10202B',
        mist: '#F5F8F7',
        sea: '#0E7C7B',
        leaf: '#7A9E48',
        clay: '#C66A4A',
        amber: '#D98E04'
      },
      boxShadow: {
        panel: '0 16px 40px rgba(16, 32, 43, 0.09)'
      }
    }
  },
  plugins: []
}
