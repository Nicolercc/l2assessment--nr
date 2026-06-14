/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: '#FBFBF9',
        surface: '#FFFFFF',
        ink: '#16181D',
        muted: '#5B616E',
        line: '#E7E6E1',
        brand: { DEFAULT: '#5B57E8', 600: '#4B47D6', 50: '#EEEDFD' },
        high: { DEFAULT: '#E5484D', bg: '#FDECEC' },
        med: { DEFAULT: '#B45309', bg: '#FEF3E2' },
        low: { DEFAULT: '#1A7F4B', bg: '#E6F6EC' },
      },
      borderRadius: { card: '16px', control: '10px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
