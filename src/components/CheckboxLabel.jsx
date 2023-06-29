import { styled } from '../theme/stitches.config';

export const CheckboxLabel = styled('div', {
  display: 'flex',
  marginLeft: '$2',
  width: '100%',
  fontFamily: '$mono',
  fontSize: '$2',
  color: '$gray6',
  '&:hover': {
    cursor: 'pointer',
  },

  variants: {
    checked: {
      true: {
        color: '$textDark',
      },
      false: {
        color: '$textMedium',
      },
    },
    active: {
      true: {
        color: '$textDark',
      },
      false: {
        color: '$textMedium',
      },
    },
  },

  compoundVariants: [
    {
      checked: true,
      active: false,
      css: {
        color: '$gray6',
      },
    },
  ],

});