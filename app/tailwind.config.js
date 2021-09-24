module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    cursor: {
      auto: 'auto',
      alias: 'alias',
      default: 'default',
      pointer: 'pointer',
      wait: 'wait',
      text: 'text',
      move: 'move',
      'not-allowed': 'not-allowed',
      crosshair: 'crosshair',
      'zoom-in': 'zoom-in',
    },
    extend: {
      transitionDelay: {
        5000: '5000ms',
      },
    },
  },
  variants: {
    extend: {
      cursor: ['disabled', 'hover'],
      display: ['group-hover'],
      backgroundColor: ['disabled'],
      backgroundImage: ['disabled'],
      opacity: ['disabled'],
      textColor: ['disabled'],
    },
  },
  plugins: [],
};
