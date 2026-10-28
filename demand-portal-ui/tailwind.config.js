/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8FAFC',          // Lighter Base Canvas (Pearl)
          surface: '#FFFFFF',     // Pure White Component Containers
          accentCyan: '#00F0FF',  // Precise Cyan highlights & focus states
          accentMagenta: '#E01A8A', // Glowing Celebration Accents (Buttons/Details)
          textPrimary: '#0F172A', // Charcoal Ink for headers
          textMuted: '#475569',   // Slates & Mid-tones for secondary text/borders
        },
      },
      backgroundImage: {
        'ingenious-glow-light': 'radial-gradient(circle at top right, rgba(224, 26, 138, 0.05), transparent 70%), radial-gradient(circle at bottom left, rgba(0, 240, 255, 0.04), transparent 60%)',
      },
      boxShadow: {
        'soft-depth': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
};