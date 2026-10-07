/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF8',
        ink: {
          DEFAULT: '#171717',
          soft: '#3D3D3D',
          muted: '#6B6B6B',
        },
        line: '#E7E5E4',
        accent: {
          DEFAULT: '#B4533A',
          50: '#FBF3F0',
          100: '#F6E5DE',
          200: '#ECC9BC',
          300: '#DFA590',
          400: '#CD7F63',
          500: '#B4533A',
          600: '#9A4530',
          700: '#7D3729',
          800: '#5F2D24',
          900: '#43241F',
        },
        success: '#3F7D5E',
        warning: '#B58A3C',
        error: '#B04040',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightish: '-0.015em',
        tighter2: '-0.03em',
      },
      lineHeight: {
        body: '1.6',
        tight: '1.2',
      },
      maxWidth: {
        prose2: '42rem',
        wide: '80rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-800px 0' },
          '100%': { backgroundPosition: '800px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
