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
        paper: {
          bg: '#F7F4EE',
          card: '#EFECE4',
          ink: '#2C2A29',
          muted: '#6C6864',
          border: '#E2DDD3',
        },
        darkpaper: {
          bg: '#1A1918',
          card: '#242220',
          ink: '#E8E4DD',
          muted: '#A29E97',
          border: '#33312E',
        },
        accent: {
          terracotta: '#8C5A4C',
          'terracotta-light': '#FAF0ED',
          sage: '#5B6B5C',
          'sage-light': '#F0F4F1',
          prune: '#6E4A58',
          'prune-light': '#F8F2F5',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'paper-soft': '0 10px 35px -5px rgba(44, 42, 41, 0.05), 0 0 2px rgba(44, 42, 41, 0.03)',
        'paper-hover': '0 18px 45px -10px rgba(44, 42, 41, 0.09), 0 0 2px rgba(44, 42, 41, 0.05)',
        'dark-soft': '0 10px 35px -5px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
