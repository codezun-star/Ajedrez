/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand identity — "botAgedrez": monochromatic red palette.
        brand: {
          50: '#fceded',
          100: '#fadada',
          200: '#f8cccc',
          300: '#f08888',
          400: '#ec6465',
          500: '#e74445',
          600: '#d62f30',
          700: '#c5191a',
          800: '#a11515',
          900: '#811111',
          950: '#4c0a0a',
        },
        amber: {
          400: '#ffc857',
          500: '#f5a623',
          600: '#d98613',
        },
        // Board palette — classic black & white (neutral grayscale). Dark
        // squares stay a charcoal grey rather than pure black so the black
        // pieces (which carry white outlines) remain perfectly legible.
        board: {
          light: '#eaeaea',
          'light-active': '#f6f6f6',
          dark: '#4d4d4d',
          'dark-active': '#6a6a6a',
        },
        // Dark surface tones
        surface: {
          950: '#0c0f1d',
          900: '#12172b',
          850: '#171d36',
          800: '#1c2440',
          700: '#26304f',
          600: '#33406b',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        board: '0 30px 60px -15px rgba(0, 0, 0, 0.55)',
        piece: '0 6px 10px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px -5px rgba(231, 68, 69, 0.55)',
        'glow-amber': '0 0 40px -5px rgba(245, 166, 35, 0.55)',
      },
      keyframes: {
        'check-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: 'inset 0 0 24px 4px rgba(239, 68, 68, 0.85)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'check-pulse': 'check-pulse 1.1s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
