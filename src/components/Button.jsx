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
  justifyContent: 'center',
  lineHeight: '1',
  outline: 'none',
  padding: '0',
  textDecoration: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  '&::before': {
    boxSizing: 'border-box',
  },
  '&::after': {
    boxSizing: 'border-box',
  },

  // Custom
  color: '$loContrast',
  backgroundColor: '$hiContrast',
  border: '1px solid $hiContrast',
  borderRadius: '$1',
  height: '$5',
  fontWeight: '$3',
  textTransform: 'uppercase',
  transition: 'all 40ms linear',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray3',
    cursor: 'pointer',
  },
  '&:disabled': {
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    color: '$gray5',
    borderColor: '$gray5',
  },
  svg: {
    marginRight: '$2'
  },

    // display: 'inherit',
    // width: '100%',
    // height: '$6',
    // marginTop: '$6',
    // fontSize: '$2',
    // border: '$1 $hiContrast solid',
    // backgroundColor: '$hiContrast',
    // color: '$loContrast',
    // '&:hover': {
    //   backgroundColor: '$gray3',
    //   color: '$hiContrast',
    // }

  variants: {
    size: {
      small: {
        fontSize: '$2',
        height: '$5',
        paddingLeft: '$3',
        paddingRight: '$3',
      },
      large: {
        fontSize: '$2',
        height: '$6',
        paddingLeft: '$4',
        paddingRight: '$4',
      },
    },
    active: {
      true: {
        backgroundColor: '$hiContrast',
        color: '$loContrast',
        '&:hover': {
          backgroundColor: '$hiContrast',
          color: '$loContrast',
        }
      },
    }
  },
});

export default Button;