import { css } from './stitches.config.js';

const globalStyle = css.global({
  body: {
    margin: '$0',
    padding: '$0',
    fontFamily: "'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif",
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },
});

export default globalStyle;
