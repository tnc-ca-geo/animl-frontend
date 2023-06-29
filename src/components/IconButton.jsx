import { styled } from '../theme/stitches.config';

const IconButton = styled('button', {
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
  '&::before': {
    boxSizing: 'border-box',
  },
  '&::after': {
    boxSizing: 'border-box',
  },

  // Custom
  backgroundColor: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$round',
  height: '$5',
  width: '$5',
  transition: 'all 40ms linear',
  '&:hover': {
    borderColor: '$gray7',
    cursor: 'pointer',
  },
  '&:active': {
    backgroundColor: '$gray5',
  },
  '&:disabled': {
    pointerEvents: 'none',
    backgroundColor: 'transparent',
    color: '$disabled',
  },

  variants: {
    size: {
      small: {
        height: '$4',
        width: '$4',
      },
      med: {
        height: '$5',
        width: '$5',
      },
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
        '&:hover': {
          backgroundColor: '$gray4',
        },
        '&:active': {
          backgroundColor: '$gray5',
        },
      },
      raised: {
        boxShadow: '0 16px 32px hsl(206deg 12% 5% / 25%), 0 3px 5px hsl(0deg 0% 0% / 10%)',
        '&:hover': {
          boxShadow: '0 16px 32px hsl(206deg 12% 5% / 25%), 0 3px 5px hsl(0deg 0% 0% / 10%)',
        },
        '&:active': {
          backgroundColor: '$gray3',
        },
      },
    },
    state: {
      active: {
        backgroundColor: '$gray4',
        color: '$blue500',
        '&:hover': {
          // boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        },
        '&:active': {
          backgroundColor: '$gray4',
        },
      },
      waiting: {
        backgroundColor: '$gray3',
        boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        '&:hover': {
          boxShadow: 'inset 0 0 0 1px hsl(206,10%,76%)',
        },
        '&:active': {
          backgroundColor: '$gray3',
        },
      },
    },
  },
});

export default IconButton;
