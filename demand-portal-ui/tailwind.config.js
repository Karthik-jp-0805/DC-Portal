/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#05050A',       // Primary Canvas
        cyberslate: '#161224',     // Surface / Card
        magenta: '#E01A8A',        // Primary Accent
        cyan: '#00F0FF',           // Secondary Accent
        frost: '#CBD5E1',          // Typography Secondary
      },
      boxShadow: {
        'glow-pill': '0 0 14px rgba(0, 240, 255, 0.45)',
        'glow-magenta': '0 0 16px rgba(224, 26, 138, 0.35)',
      }
    },
  },
  plugins: [],
}