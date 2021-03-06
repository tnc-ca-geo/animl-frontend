import { styled } from '../theme/stitches.config';

const IconButton = styled.button({
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
  border: '1px solid $gray600',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  transition: 'all 40ms linear',
  ':hover': {
    borderColor: '$gray700',
    cursor: 'pointer',
  },
  ':active': {
    backgroundColor: '$gray100',
  },
  ':disabled': {
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    color: '$gray500',
  },

  variants: {
    size: {
      large: {
        height: '$6',
        width: '$6',
      },
      xl: {
        height: '$7',
        width: '$7',
      },
      xxl: {
        height: '$8',
        width: '$8',
      },
    },
    variant: {
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: '0',
        ':hover': {
          backgroundColor: '$gray300',
        },
        ':active': {
          backgroundColor: '$gray400',
        },
      },
      raised: {
        boxShadow: '0 16px 32px hsl(206deg 12% 5% / 25%), 0 3px 5px hsl(0deg 0% 0% / 10%)',
        ':hover': {
          boxShadow: '0 16px 32px hsl(206deg 12% 5% / 25%), 0 3px 5px hsl(0deg 0% 0% / 10%)',
        },
        ':active': {
          backgroundColor: '$gray300',
        },
      },
    },
    state: {
      active: {
        backgroundColor: '$gray300',
        color: '$blue500',
        ':hover': {
          // boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        },
        ':active': {
          backgroundColor: '$gray300',
        },
      },
      waiting: {
        backgroundColor: '$gray300',
        boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        ':hover': {
          boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        },
        ':active': {
          backgroundColor: '$gray300',
        },
      },
    },
  },
});

export default IconButton;
