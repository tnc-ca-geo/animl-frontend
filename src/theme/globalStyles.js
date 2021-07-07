import { css } from './stitches.config.js';

const globalStyle = css.global({
  // TODO: bug in stitches addes an extra '-' prefix to global styles
  // https://github.com/modulz/stitches/issues/295
  // so remember to correct for them (add back the '-') after updating stitches 
  ':root': {
    '-amplify-primary-color': '#003BD7',  // TODO: replace w/ '--amplify-primary-color'
    '-amplify-primary-tint': '#003BD7',
    '-amplify-primary-shade': '#003BD7',
    '-amplify-font-family': "'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif",
  },
  body: {
    margin: '$0',
    padding: '$0',
    fontFamily: "'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif",
    'webkit-font-smoothing': 'antialiased', // TODO: replace w/ '-webkit-font-smoothing'
    'moz-osx-font-smoothing': 'grayscale', // TODO: replace w/ '-moz-osx-font-smoothing'
  },
});

export default globalStyle;
