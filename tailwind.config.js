/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e3370',
          900: '#172554',
          950: '#0f172a',
        },
        accent: {
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#0c1425',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        display: ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':        'fadeIn 0.4s ease-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-left':     'slideLeft 0.3s ease-out',
        'slide-right':    'slideRight 0.3s ease-out',
        'pulse-slow':     'pulse 3s infinite',
        'spin-slow':      'spin 3s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'glow-pulse':     'glowPulse 2s ease-in-out infinite',
        'shimmer':        'shimmer 1.5s infinite',
        'scale-in':       'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(56, 189, 248, 0.3)' },
          '50%':      { boxShadow: '0 0 20px rgba(56, 189, 248, 0.6)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backdropBlur: {
        xs:  '2px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass':       '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'glass-dark':  '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'glass-sm':    '0 4px 16px 0 rgba(31, 38, 135, 0.08)',
        'panel':       '0 4px 24px rgba(0,0,0,0.12)',
        'card':        '0 2px 12px rgba(0,0,0,0.08)',
        'card-hover':  '0 8px 30px rgba(0,0,0,0.12)',
        'glow':        '0 0 20px rgba(59,130,246,0.35)',
        'glow-accent': '0 0 24px rgba(56,189,248,0.3)',
        'glow-gold':   '0 0 20px rgba(251,191,36,0.3)',
        'elevated':    '0 10px 40px -8px rgba(0,0,0,0.2)',
        'inner-glow':  'inset 0 1px 1px rgba(255,255,255,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
