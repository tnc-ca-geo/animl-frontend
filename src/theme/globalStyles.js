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

    // Date Picker styles
    // Had to override them here b/c the actual Date Picker element gets 
    // appended to the body (and thus you can't dump style overrides in a 
    // wrapper element)

    '.DateInput_input': {
      color: '$hiContrast',
      fontFamily: '$mono',
      fontWeight: '$2',
    },
    '.DateInput__small': {
      width: '109px',
    },
    '.DateInput_input__focused': {
      borderBottomColor: '$blue600',
    },
    '.DateRangePickerInput_clearDates_default:focus': {
      backgroundColor: '$gray300',
    },
    '.DateRangePickerInput_clearDates_default:hover': {
      backgroundColor: '$gray200',
    },
    '.CalendarDay__default': {
      border: 'none',
    },
    '.CalendarDay__blocked_out_of_range': {
      border: 'none',
    },
    '.CalendarDay__selected_span': {
      background: '$blue200',
      color: '$hiContrast',
      border: '1px solid $gray400',
    },
    '.CalendarDay__selected': {
      background: '$blue600',
      color: '$loContrast',
      border: '1px solid $blue600',
    },
    '.CalendarDay__selected_span:hover': {
      background: '$blue400',
      color: '$loContrast',
    },
    '.CalendarDay__selected:hover': {
      background: '$blue400',
      color: '$loContrast',
      border: '1px solid $blue200',
    },
    '.CalendarDay__hovered_span': {
      background: '$gray200',
      color: '$hiContrast',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: '$2 solid $loContrast',
      borderBottom: '$2 solid $loContrast',
    },
  },
});

export default globalStyles;
