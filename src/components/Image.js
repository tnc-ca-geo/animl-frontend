import { styled } from '../theme/stitches.config';

export const Image = styled.img({
  // Reset
  verticalAlign: 'middle',
  maxWidth: '100%',
  border: '1px solid rgba(0,0,0,0)',
  variants: {
    selected: {
      true: {
        outline: 'none',
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',  
      }
    }
  }
});
