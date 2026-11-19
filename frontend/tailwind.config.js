/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette: Beige + Dark Grey
        beige: {
          50:  '#faf8f6',
          100: '#f5f0eb',
          200: '#ede4da',
          300: '#DDD0C8',   // primary beige
          400: '#cbb89f',
          500: '#b89e82',
          600: '#9e8265',
          700: '#7d6449',
          800: '#5c4733',
          900: '#3a2d20',
          950: '#1e1710',
        },
        charcoal: {
          50:  '#f5f2f0',
          100: '#ede8e3',
          200: '#d4c8bf',
          300: '#b0998e',
          400: '#8c7268',
          500: '#6b5248',
          600: '#52403a',   // warm grey-brown mid
          700: '#3d2f2a',   // primary dark warm grey-brown
          800: '#2e2320',   // deep warm brown-grey
          900: '#231a17',   // very dark brown
          950: '#160f0d',   // near-black dark brown
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'scanline': 'scanline 2.2s ease-in-out infinite',
        'bar-grow': 'barGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'count-up': 'fadeIn 0.6s ease-out both',
      },
      keyframes: {
        barGrow: {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },
      backgroundImage: {
        'beige-gradient': 'linear-gradient(135deg, #DDD0C8 0%, #f5f0eb 100%)',
        'charcoal-gradient': 'linear-gradient(135deg, #323232 0%, #474747 100%)',
        'warm-gradient': 'linear-gradient(135deg, #DDD0C8 0%, #cbb89f 50%, #b89e82 100%)',
      },
    },
  },
  plugins: [],
};
