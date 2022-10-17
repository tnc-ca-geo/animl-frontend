import { styled } from '../theme/stitches.config';

export const CheckboxLabel = styled('div', {
  display: 'flex',
  marginLeft: '$2',
  width: '100%',
  fontFamily: '$mono',
  fontSize: '$2',
  color: '$gray600',
  '&:hover': {
    cursor: 'pointer',
  },

  variants: {
    checked: {
      true: {
        color: '$hiContrast',
      },
      false: {
        color: '$gray600',
      },
    },
    active: {
      true: {
        color: '$hiContrast',
      },
      false: {
        color: '$gray600',
      },
    },
  },

  compoundVariants: [
    {
      checked: true,
      active: false,
      css: {
        color: '$gray600',
      },
    },
  ],

});