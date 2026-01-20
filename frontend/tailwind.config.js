/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GPO/Pirate Theme Colors
        'ocean': {
          50: '#e6f3ff',
          100: '#b3daff',
          200: '#80c1ff',
          300: '#4da8ff',
          400: '#1a8fff',
          500: '#0066cc',
          600: '#004d99',
          700: '#003366',
          800: '#001a33',
          900: '#000d1a',
          950: '#000911',
        },
        'gold': {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffdf80',
          300: '#ffd24d',
          400: '#ffc61a',
          500: '#e6a800',
          600: '#b38200',
          700: '#805c00',
          800: '#4d3700',
          900: '#1a1200',
        },
        'pirate': {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#bdbdbd',
          300: '#9e9e9e',
          400: '#757575',
          500: '#616161',
          600: '#424242',
          700: '#212121',
          800: '#121212',
          900: '#0a0a0a',
        },
        // Rarity colors
        'common': '#9e9e9e',
        'uncommon': '#4caf50',
        'rare': '#2196f3',
        'epic': '#9c27b0',
        'legendary': '#ff9800',
        'mythical': '#e91e63',
        'event': '#00bcd4',
      },
      fontFamily: {
        'pirate': ['Pirata One', 'cursive'],
        'display': ['Cinzel', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #001a33 0%, #003366 50%, #004d99 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffd24d 0%, #e6a800 50%, #b38200 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(26, 143, 255, 0.1) 0%, rgba(0, 77, 153, 0.2) 100%)',
        'pirate-texture': "url('/textures/parchment.png')",
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(230, 168, 0, 0.4)',
        'glow-blue': '0 0 20px rgba(26, 143, 255, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(230, 168, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(230, 168, 0, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
