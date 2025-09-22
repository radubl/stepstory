/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#6200ea',
        'primary-dark': '#3700b3',
        'primary-light': '#9d46ff',
        secondary: '#03dac6',
        accent: '#bb86fc',
        error: '#cf6679',
        'dark-bg': '#121212',
        'dark-surface': '#1e1e1e',
        'dark-elevated': '#2d2d2d',
        'dark-card': '#2c2c2c',
        'dark-primary': '#e1e1e1',
        'dark-secondary': '#b0b0b0',
        'light-bg': '#ffffff',
        'light-surface': '#f5f5f5',
        'light-elevated': '#e0e0e0',
        'light-primary': '#212121',
        'light-secondary': '#666666',
        'border-dark': '#333333',
        'border-light': '#e0e0e0',
        'divider-dark': '#424242',
        'divider-light': '#e0e0e0',
        success: '#4caf50',
        info: '#2196f3',
        warning: '#ff9800',
      },
      boxShadow: {
        'dark-sm': '0 2px 4px rgba(0, 0, 0, 0.5)',
        'dark': '0 4px 6px rgba(0, 0, 0, 0.5)',
        'dark-md': '0 6px 10px rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #bb86fc, #9d46ff)',
        'gradient-accent': 'linear-gradient(90deg, #03dac6, #018786)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}