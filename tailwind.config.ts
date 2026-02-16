import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'glass-light': 'rgba(255, 255, 255, 0.1)',
        'glass-lighter': 'rgba(255, 255, 255, 0.05)',
      },
      backdropFilter: {
        'glass': 'blur(10px)',
        'glass-md': 'blur(16px)',
        'glass-lg': 'blur(20px)',
        'glass-xl': 'blur(24px)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, rgba(25, 25, 112, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'status-online': 'status-online 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'status-online': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)' },
          '50%': { boxShadow: '0 0 12px rgba(34, 197, 94, 1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
