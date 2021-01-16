import { styled } from '../theme/stitches.config.js';

const Button = styled('button', {
  // Reset
  alignItems: 'center',
  appearance: 'none',
  borderWidth: '0',
  boxSizing: 'border-box',
  display: 'inline-flex',
  flexShrink: 0,
  fontFamily: 'inherit',
  fontSize: '14px',
  justifyContent: 'center',
  lineHeight: '1',
  outline: 'none',
  padding: '0',
  textDecoration: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  color: '$hiContrast',
  '::before': {
    boxSizing: 'border-box',
  },
  '::after': {
    boxSizing: 'border-box',
  },

  // Custom
  backgroundColor: '$loContrast',
  border: '1px solid $hiContrast',
  borderRadius: '$1',
  height: '$5',
  // width: '$5',
  transition: 'all 40ms linear',
  // borderWidth: '0',
  ':hover': {
    backgroundColor: '$gray300',
    cursor: 'pointer',
  },
  // ':hover': {
  //   borderColor: '$gray700',
  //   cursor: 'pointer',
  // },
  // ':active': {
  //   backgroundColor: '$gray100',
  // },
  ':disabled': {
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    color: '$gray500',
  },

  // backgroundColor: '$gray400',
  // color: '$gray700',
  // fontSize: '$2',
  // lineHeight: '1',
  // fontWeight: 500,
  // border: '0',

  variants: {
    size: {
      small: {
        fontSize: '$2',
        height: '$5',
        paddingLeft: '$2',
        paddingRight: '$2',
      },
      large: {
        fontSize: '$3',
        height: '$6',
        paddingLeft: '$4',
        paddingRight: '$4',
      },
    },
    active: {
      true: {
        backgroundColor: '$hiContrast',
        color: '$loContrast',
        ':hover': {
          backgroundColor: '$hiContrast',
          color: '$loContrast',
        }
      },
    }
  },
});

export default Button;