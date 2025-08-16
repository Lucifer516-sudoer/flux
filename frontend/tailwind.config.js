/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0d1117',
        'profit': '#00ff88',
        'loss': '#ff2e63',
        'highlight': '#00d9ff',
        'neutral-text': '#c9d1d9',
        'border-dark': '#2a3037',
        'border-light': '#4a5057',
      },
      fontFamily: {
        'mono': ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-profit': '0 0 15px 0 rgba(0, 255, 136, 0.5)',
        'glow-loss': '0 0 15px 0 rgba(255, 46, 99, 0.5)',
        'glow-highlight': '0 0 15px 0 rgba(0, 217, 255, 0.5)',
        'glow-neutral': '0 0 10px 0 rgba(201, 209, 217, 0.1)',
      }
    },
  },
  plugins: [],
}
