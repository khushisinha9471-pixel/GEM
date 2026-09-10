/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B2345',
          50: '#EEF2F8',
          100: '#D7E0EE',
          600: '#123661',
          700: '#0B2345',
          800: '#081A34',
          900: '#051122',
        },
        slate: {
          DEFAULT: '#4B556B',
        },
        surface: '#E9EEF7',
        line: '#D9DEE7',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,35,69,0.06), 0 1px 8px rgba(11,35,69,0.05)',
        pop: '0 8px 30px rgba(11,35,69,0.18)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
