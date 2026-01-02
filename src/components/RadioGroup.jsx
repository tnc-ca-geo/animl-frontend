import { styled } from '../theme/stitches.config.js';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

const RadioGroup = styled(RadioGroupPrimitive.Root, {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '$5',
});

const RadioItemWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const RadioItem = styled(RadioGroupPrimitive.Item, {
  padding: 0,
  backgroundColor: 'white',
  border: '1px solid $border',
  width: '16px',
  height: '16px',
  borderRadius: '100%',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '$gray100',
    boxShadow: '0 2px 10px var(--black-a7)',
  },
  '&:focus': { boxShadow: '0 0 0 2px $blue500' },
  '[data-state="checked"]': {
    borderRadius: '100%',
    boxShadow: '0 2px 10px var(--black-a7)',
  },
});

const RadioIndicator = styled(RadioGroupPrimitive.Indicator, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  position: 'relative',
  '&::after': {
    content: '',
    display: 'block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '$backgroundBlack',
  },
});

const RadioLabel = styled('span', {
  fontSize: '$3',
  fontWeight: '$3',
  color: '$textDark',
  lineHeight: '1.5',
  cursor: 'pointer',
});

export { RadioGroup, RadioItemWrapper, RadioItem, RadioIndicator, RadioLabel };
