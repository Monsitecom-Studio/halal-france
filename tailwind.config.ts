import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        halal: {
          green: '#1a6e35',
          'green-light': '#22a24f',
          'green-dark': '#145828',
          'green-darker': '#0f4a23',
          gold: '#b07d1a',
          cream: '#f8f7f4',
        },
        cert: {
          avs: '#2563eb',
          argml: '#7c3aed',
          mosquee: '#d97706',
          acmif: '#059669',
          unknown: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
