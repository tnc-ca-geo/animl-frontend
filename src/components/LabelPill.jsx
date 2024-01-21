import { styled } from '../theme/stitches.config.js';
import { getTextColor } from '../app/utils.js';

const Pill = styled('div', {
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

const LabelPill = ({ color, children, ...props }) => {
  return (
    <Pill
      css={{
        backgroundColor: color,
        borderColor: color,
        color: getTextColor(color),
      }}
      {...props}
    >
      {children}
    </Pill>
  );
}

export default LabelPill;
