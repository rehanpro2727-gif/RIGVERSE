/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rigverse: {
          bg: '#0b0b14',
          muted: '#9ca3af',
          'neon-cyan': '#00f3ff',
          'neon-violet': '#b24bff',
          'neon-pink': '#ff0080',
          'neon-amber': '#ffb800',
        },
        // DEFAULT keeps Tailwind's built-in shades (green-500, red-900, ...) intact
        // while allowing bare utilities such as bg-green/10 used in globals.css.
        green: { DEFAULT: '#00e676' },
        amber: { DEFAULT: '#ffb800' },
        rose: { DEFAULT: '#ff3b3b' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
