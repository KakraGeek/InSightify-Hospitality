import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E293B',
          orange: '#F97316',
          gray: '#94A3B8',
          light: '#F1F5F9',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
