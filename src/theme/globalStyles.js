import { globalCss } from './stitches.config.js';

const globalStyles = globalCss({
  '@import': [
    "url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Source+Sans+Pro:wght@300;400;600;700&display=swap')",
  ],
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
      color: '$textDark',
      fontFamily: '$mono',
      fontWeight: '$2',
      padding: '$2 !important',
      '@bp2': {
        padding: '$3',
      },
    },
    '.DateInput__small': {
      width: '109px',
    },
    '.DateInput_input__focused': {
      borderBottomColor: '$blue600',
    },
    '.DateRangePicker_picker': {
      zIndex: '$5',
      pointerEvents: 'auto',
    },
    '.DateRangePickerInput_clearDates_default:focus': {
      backgroundColor: '$gray3',
    },
    '.DateRangePickerInput_clearDates_default:hover': {
      backgroundColor: '$gray4',
    },
    '.CalendarDay__default': {
      border: 'none',
    },
    '.CalendarDay__blocked_out_of_range': {
      border: 'none',
    },
    '.CalendarDay__selected_span': {
      background: '$blue200',
      color: '$textDark',
      border: '1px solid $border',
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
      background: '$gray2',
      color: '$textDark',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: '$2 solid $loContrast',
      borderBottom: '$2 solid $loContrast',
    },
  },
});

export default globalStyles;
