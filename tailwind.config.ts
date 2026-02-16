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
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, rgba(25, 25, 112, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
