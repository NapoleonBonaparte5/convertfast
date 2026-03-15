/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edfafa',
          100: '#d5f5f6',
          200: '#afeaed',
          300: '#73d8de',
          400: '#36bdc6',
          500: '#1a9faa',
          600: '#177d8a',
          700: '#186572',
          800: '#1a515c',
          900: '#1a434e',
          950: '#0b2c35',
        },
        accent: {
          DEFAULT: '#00d4ff',
          dark: '#00a3c4',
        },
        dark: {
          bg:      '#0a0f1e',
          card:    '#111827',
          border:  '#1f2937',
          surface: '#162032',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px #00d4ff33, 0 0 10px #00d4ff22' },
          '100%': { boxShadow: '0 0 20px #00d4ff66, 0 0 40px #00d4ff33' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':    'linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
