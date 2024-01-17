import { styled } from '../theme/stitches.config.js';

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

function getColor(bgColor) {
  const threshold = 0.6
  const [red, green, blue] = [0, 2, 4].map((i) => parseInt(bgColor.slice(i + 1, i + 3), 16));
  const l = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;
  return l < threshold ? '#fff' : '$textDark';
}

function LabelPill ({ color, children, ...props }) {
  return (
    <Pill
      css={{
        backgroundColor: color,
        borderColor: color,
        color: getColor(color),
      }}
      {...props}
    >
      {children}
    </Pill>
  );
}

export default LabelPill;
