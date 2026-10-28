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
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        obsidian: {
          950: '#05070e',
          900: '#070b16',
          850: '#0b1122',
          800: '#10172c',
          700: '#18223f',
        },
        cobalt: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          glow: '#1e40af',
        },
        celebration: {
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
        champagne: {
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
