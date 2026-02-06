/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta verde minimalista
        green: {
          darkest: '#203500',
          darker: '#283e06',
          dark: '#31470b',
          mediumDark: '#3b5110',
          medium: '#445a14',
          mediumLight: '#586e26',
          light: '#778c43',
          lighter: '#96ac60',
          lightest: '#b7cd7f',
          pale: '#d9ef9f',
        },
        // Colores funcionales basados en la paleta
        strength: '#586e26', // Verde medio para Fuerza
        circuit: '#778c43', // Verde claro para Circuitos
        cardio: '#445a14', // Verde oscuro para Cardio/Tabata
        primary: '#586e26',
        secondary: '#96ac60',
        accent: '#b7cd7f',
      }
    },
  },
  plugins: [],
}
