/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Mobile-first screens
    screens: {
      'xs':  '375px',  // Small phones
      'sm':  '640px',  // Large phones
      'md':  '768px',  // Tablets
      'lg':  '1024px', // Laptops
      'xl':  '1280px', // Desktops
      '2xl': '1536px', // Large desktops
    },
    extend: {
      colors: {
        red: { DEFAULT: '#CC0000', dark: '#990000', light: '#FF2222' },
        court: { dark: '#060200', mid: '#0a0400', light: '#0f0600' },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      // Touch-target safe spacing
      spacing: {
        'touch': '48px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minHeight: { touch: '48px' },
      minWidth:  { touch: '48px' },
      // Fluid type sizes
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 3vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 4vw, 2rem)',
        'fluid-2xl': 'clamp(2rem, 6vw, 4rem)',
        'fluid-hero': 'clamp(2.5rem, 12vw, 10rem)',
      },
      // Line heights per WCAG
      lineHeight: {
        'readable': '1.6',
        'relaxed': '1.7',
      },
    },
  },
  plugins: [],
}
