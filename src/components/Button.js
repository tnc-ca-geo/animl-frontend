import { styled } from '../theme/stitches.config.js';

const Button = styled('button', {
  backgroundColor: '$gray400',
  color: '$gray700',
  fontSize: '$2',
  lineHeight: '1',
  fontWeight: 500,
  border: '0',

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
  },
});

export default Button;