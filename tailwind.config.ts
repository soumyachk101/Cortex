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
        accent: {
          DEFAULT: '#6366F1',
          light: '#A5B4FC',
          dark: '#4F46E5',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E293B',
        },
        bg: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          'primary-dark': '#F1F5F9',
          'secondary-dark': '#94A3B8',
        },
        border: {
          light: '#E2E8F0',
          dark: '#334155',
        },
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
