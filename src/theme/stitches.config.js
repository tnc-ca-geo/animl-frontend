import { createStitches } from '@stitches/react';
import { tomato, slate, green, orange } from '@radix-ui/colors';

export const { styled, css, globalCss, keyframes, getCssText, theme, createTheme, config } = createStitches({
  theme: {
    colors: {
      hiContrast: slate.slate12, //'#000000', //'#031b4e', // black
      loContrast: slate.slate1, // '#FFFFFF', // white

      successBg: green.green4,
      successBase: green.green9,
      successText: green.green11,
      warningBg: orange.orange4,
      warningBase: orange.orange9,
      warningText: orange.orange11,
      errorBg: tomato.tomato4,
      errorBase: tomato.tomato9,
      errorText: tomato.tomato11,
      disabled: slate.slate8,

      // text
      textDark: slate.slate12,
      textMedium: slate.slate11,
      textLight: slate.slate9,

      // backgrounds
      backgroundExtraDark: slate.slate4,
      backgroundDark: slate.slate3,
      backgroundMedium: slate.slate2,
      backgroundLight: slate.slate1,

      border: slate.slate7,

      gray1: slate.slate1,
      gray2: slate.slate2,
      gray3: slate.slate3,
      gray4: slate.slate4,
      gray5: slate.slate5,
      gray6: slate.slate6,
      gray7: slate.slate7,
      gray8: slate.slate8,
      gray9: slate.slate9,
      gray10: slate.slate10,
      gray11: slate.slate11,
      gray12: slate.slate12,

      // TODO: redesign our accent color scale.
      // Maybe it doesn't need to be a scale? use blue500 for accent and
      // jsut use radix indigo scale for all other blue??

      blue200: '#E8EFFF', //'#E7FCFF',
      blue300: '#86EAFA',
      blue400: '#30ADED',
      blue500: '#003BD7',
      blue600: '#0002C7',
      blue700: '#161e2e',
    },
    shadows: {
      gray3: '#F0F0F0',
      blue200: '#E8EFFF', //'#E7FCFF',
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
      6: '24px',
      7: '36px',
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
  media: {
    bp1: '(min-width: 640px)',
    bp2: '(min-width: 768px)',
    bp3: '(min-width: 1024px)',
    bp4: '(min-width: 1280px)',
  },
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
