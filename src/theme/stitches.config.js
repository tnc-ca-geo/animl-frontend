import { createStitches } from '@stitches/react';

// Mapping label categories to colors
const labelColorMap = {
  animal: { primary: '#F3CA6C', text: 'hiContrast' },
  fox:    { primary: '#345EFF', text: 'loContrast' },
  skunk:  { primary: '#E83797', text: 'loContrast' },
  rodent: { primary: '#E04040', text: 'loContrast' },
  person: { primary: '#00C797', text: 'hiContrast' },
  empty:  { primary: '#DEDEDE', text: 'hiContrast'},
  default: { primary: '#00C797', text: 'hiContrast' },
};

export const labelColors = (label) => (
  labelColorMap[label] || labelColorMap.default
);

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      hiContrast: '#000000', //'#031b4e', // black
      loContrast: '#FFFFFF', // white
      warning: '#E04040',

      gray200: '#FAFAFA',
      gray300: '#F0F0F0',
      gray400: '#DEDEDE',
      gray500: '#B1B1B1',
      gray600: '#7B7B7B',

      blue200: '#E8EFFF',//'#E7FCFF',
      blue300: '#86EAFA',
      blue400: '#30ADED',
      blue500: '#003BD7',
      blue600: '#0002C7',
      blue700: '#161e2e', 

    },
    sizes: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '40px',
      7: '48px',
      8: '56px',
      9: '64px',
      10: '72px',
    },
    space: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '40px',
      7: '48px',
      8: '56px',
      9: '64px',
      10: '72px',
    },
    fontSizes: {
      1: '10px',
      2: '12px',
      3: '14px',
      4: '16px',
      5: '20px',
    },
    fonts: {
      sourceSansPro: `Source Sans Pro`, 
      roboto: `Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, 
        Helvetica Neue, sans-serif`,
      mono: 'IBM Plex Mono, Roboto Mono, Courier New, monospace',
    },
    fontWeights: {
      1: '300',
      2: '400',
      3: '500',
      4: '600',
      5: '700',
    },
    // lineHeights: {},
    // letterSpacings: {},
    // borderWidths: {},
    // borderStyles: {},
    radii: {
      1: '3px',
      2: '5px',
      3: '15px',
      4: '25px',
      round: '50%',
      pill: '9999px',
    },
    // shadows: {},
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      5: '500',
      6: '600',
    },
    // transitions: {},
  },
  // media: {
  //   bp1: '(min-width: 480px)',
  // },
  // utils: {
  //   marginX: (value) => ({ marginLeft: value, marginRight: value }),
  // },
});

// export const rotateAnimation = css.keyframe({
//   '0%': {
//     // styles
//   },
//   '100%': {
//     // styles
//     transform: 'rotate(360deg)',
//   }
// });

