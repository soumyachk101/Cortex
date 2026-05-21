import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Botanical Palette
        alabaster: '#F9F8F4',
        forest: '#2D3A31',
        sage: '#8C9A84',
        clay: '#DCCFC2',
        stone: '#E6E2DA',
        terracotta: '#C27B66',
        cream: '#F2F0EB',
        mushroom: '#B8ADA0',
        // Semantic
        bg: {
          light: '#F9F8F4',
          dark: '#1A2118',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#243028',
        },
        text: {
          primary: '#2D3A31',
          secondary: '#6B7A6E',
          'primary-dark': '#E8E5DF',
          'secondary-dark': '#9CA89E',
        },
        border: {
          light: '#E6E2DA',
          dark: '#3A4A3D',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'arch': '200px',
      },
      boxShadow: {
        'botanical': '0 4px 6px -1px rgba(45, 58, 49, 0.05)',
        'botanical-md': '0 10px 15px -3px rgba(45, 58, 49, 0.05)',
        'botanical-lg': '0 20px 40px -10px rgba(45, 58, 49, 0.05)',
        'botanical-xl': '0 25px 50px -12px rgba(45, 58, 49, 0.15)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
