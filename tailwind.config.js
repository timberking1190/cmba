/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#CC0000', dark: '#990000', light: '#FF2222' },
        court: { dark: '#060200', mid: '#0a0400', light: '#0f0600' },
      },
      fontFamily: {
        display: ['var(--font-bebas)'],
        body: ['var(--font-jakarta)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  plugins: [],
}
