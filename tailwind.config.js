/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#0b0c10',
        mist: '#0f1117',
        ember: '#f55f45',
        smoke: '#a9b4c7',
        aurora: '#6dd3ff',
        obsidian: '#12141c',
        chrome: '#1b1f2a'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(245,95,69,0.25)',
        soft: '0 10px 40px rgba(0,0,0,0.45)'
      },
      keyframes: {
        grain: {
          '0%, 100%': { backgroundPosition: '0 0' },
          '10%': { backgroundPosition: '-5% -10%' },
          '20%': { backgroundPosition: '10% -20%' },
          '30%': { backgroundPosition: '0% 20%' },
          '40%': { backgroundPosition: '-10% 5%' },
          '50%': { backgroundPosition: '5% 15%' },
          '60%': { backgroundPosition: '-15% 0%' },
          '70%': { backgroundPosition: '0% -15%' },
          '80%': { backgroundPosition: '15% 10%' },
          '90%': { backgroundPosition: '-5% 5%' }
        }
      },
      animation: {
        grain: 'grain 8s steps(10) infinite'
      }
    }
  },
  plugins: []
}
