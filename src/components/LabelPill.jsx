import { styled } from '../theme/stitches.config.js';

const LabelPill = styled('div', {
  color: '$textDark',
  fontSize: '$2',
  fontWeight: '$5',
  fontFamily: '$mono',
  padding: '$1 $3',
  '&:not(:last-child)': {
    marginRight: '$2',
  },
  borderRadius: '$3',
  border: '1px solid rgba(0,0,0,0)',
  transition: 'all 0.2s ease',
  variants: {
    focused: {
      true: {
        outline: 'none',
        boxShadow: '0 0 0 3px $blue200',
        borderColor: '$blue500',  
      }
    }
  }
});

export default LabelPill;
