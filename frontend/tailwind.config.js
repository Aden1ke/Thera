/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'soul-green': '#3B4021',       
        'ember-moss': '#2D531A',       
        'growth-lime': '#6E9E28',      
        'serene-sage': '#A4A175',      
        'crisis-red': '#B91C1C',       
        'crisis-red-dark': '#7a130f',  // Added dark crisis red
        'healing-teal': '#02CF7F',     
        'healing-teal-dark': '#02b56f', // Darker teal for hover
        'night-grove': '#2C2E2A'       
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif'],
        serif: ['Merriweather', 'ui-serif'],
        display: ['"Playfair Display"']
      },
      fontSize: {
        'ritual': '1.1rem',
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      lineHeight: {
        relaxed: '1.75',
        snug: '1.375',
        tight: '1.25',
        looser: '2',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.1)'
      },
      stroke: theme => ({
        'growth-lime': theme('colors.growth-lime'),
        'healing-teal': theme('colors.healing-teal'),
        'crisis-red': theme('colors.crisis-red'),
        'crisis-red-dark': theme('colors.crisis-red-dark'),
        'serene-sage': theme('colors.serene-sage'),
      }),
    },
  },
  plugins: [],
}
