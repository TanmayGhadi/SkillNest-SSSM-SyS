/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dcce',
          300: '#9ec4ad',
          400: '#73a586',
          500: '#528966',
          600: '#3e6e50',
          700: '#335841',
          800: '#2a4735',
          900: '#1b382b',
          950: '#0e2017',
        },
        cream: {
          50: '#fdfdfb',
          100: '#fbf9f4',
          200: '#f5f1e8',
          300: '#ede6d8',
          400: '#ded4c0',
          500: '#c5b89e',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ece6',
          200: '#cddbcE',
          300: '#a7c1a9',
          400: '#7ea181',
          500: '#5e8461',
        },
        terracotta: {
          50: '#fbf5f2',
          100: '#f6e9e3',
          500: '#b85d36',
          600: '#a24b27',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        handwriting: ['"Caveat"', 'cursive'],
      }
    },
  },
  plugins: [],
}
