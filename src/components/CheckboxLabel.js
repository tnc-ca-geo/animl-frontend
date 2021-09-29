import { styled } from '../theme/stitches.config';

export const CheckboxLabel = styled('span', {
  marginLeft: '$2',
  fontFamily: '$mono',
  fontSize: '$3',
  color: '$gray600',
  '&:hover': {
    cursor: 'pointer',
  },

  variants: {
    checked: {
      true: {
        color: '$hiContrast',
      },
    },
    active: {
      false: {
        color: '$gray600',
      },
    },
  },

});