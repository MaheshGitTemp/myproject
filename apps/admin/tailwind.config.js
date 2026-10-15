/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Mirrors the member app brand tokens for a consistent design language.
        brand: { DEFAULT: '#a84040', dark: '#8B0000', light: '#be7e80', soft: '#fff5f5' },
        gold: { DEFAULT: '#d4af37', light: '#f4d03f' },
      },
    },
  },
};
