import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        classic: ['Cormorant Garamond', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        'bg-deep': '#faf9f7',
      },
      backdropBlur: {
        '2xl': '40px',
      },
    },
  },
  plugins: [],
} satisfies Config;
