import { createStyled } from '@stitches/react';

export const { styled, css } = createStyled({
  tokens: {
    colors: {
      $hiContrast: '#000000', // black
      $loContrast: '#FFFFFF', // white

      $gray200: '#FAFAFA',
      $gray300: '#F0F0F0',
      $gray400: '#DEDEDE',
      $gray500: '#B1B1B1',
      $gray600: '#7B7B7B',

      $blue200: '#E7FCFF',
      $blue300: '#86EAFA',
      $blue400: '#30ADED',
      $blue500: '#003BD7',
      $blue600: '#0002C7',
    },
    sizes: {
      $0: '0px',
      $1: '4px',
      $2: '8px',
      $3: '16px',
      $4: '24px',
      $5: '32px',
      $6: '40px',
      $7: '48px',
      $8: '56px',
      $9: '64px',
      $10: '72px',
    },
    space: {
      $0: '0px',
      $1: '4px',
      $2: '8px',
      $3: '16px',
      $4: '24px',
      $5: '32px',
      $6: '40px',
      $7: '48px',
      $8: '56px',
      $9: '64px',
      $10: '72px',
    },
    fontSizes: {
      $1: '10px',
      $2: '12px',
      $3: '14px',
      $4: '16px',
      $5: '20px',
    },
    fonts: {
      $roboto: `Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, 
        Helvetica Neue, sans-serif`,
      $mono: 'Roboto Mono, Courier New, monospace',
    },
    fontWeights: {
      $1: '300',
      $2: '400',
      $3: '500',
      $4: '600',
      $5: '700',
    },
    // lineHeights: {},
    // letterSpacings: {},
    borderWidths: {
      $1: '1px',
      $2: '4px',
      $3: '8px',
    },
    // borderStyles: {},
    radii: {
      $1: '3px',
      $2: '5px',
      $3: '15px',
      $round: '50%',
      $pill: '9999px',
    },
    // shadows: {},
    zIndices: {
      $1: '100',
      $2: '200',
      $3: '300',
    },
    // transitions: {},
  },
});