/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: { xs:'375px', sm:'640px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px' },
    extend: {
      colors: {
        red: { DEFAULT: '#CC0000', dark: '#990000', light: '#EF4444' },
        court: { dark: '#060200', mid: '#0a0400', light: '#0f0600' },
        // Semantic text colors — all pass WCAG AA on #060200
        readable: {
          primary:   '#F1F5F9', // 19.5:1
          secondary: '#CBD5E1', // 12.1:1
          muted:     '#94A3B8', //  5.6:1
          subtle:    '#64748B', //  3.5:1 — large/UI only
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'label': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.12em' }],  /* 11px */
        'label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }],  /* 12px */
        'fluid-hero': ['clamp(2.5rem, 12vw, 10rem)', { lineHeight: '0.88' }],
      },
      spacing: {
        'touch': '48px',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      minHeight: { touch: '48px' },
      minWidth:  { touch: '48px' },
      lineHeight: { readable: '1.65' },
    },
  },
  plugins: [],
}
