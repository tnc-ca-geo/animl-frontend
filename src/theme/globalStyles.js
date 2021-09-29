import { globalCss } from './stitches.config.js';

const globalStyles = globalCss({
  ':root': {
    '--amplify-primary-color': '#003BD7',
    '--amplify-primary-tint': '#003BD7',
    '--amplify-primary-shade': '#003BD7',
    '--amplify-font-family': "'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif",
  },
  body: {
    margin: '$0',
    padding: '$0',
    fontFamily: "'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif",
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },
});

export default globalStyles;
