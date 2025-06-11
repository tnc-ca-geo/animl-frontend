import * as PopoverPrimitive from '@radix-ui/react-popover';
import { styled } from '../theme/stitches.config';
import { blue } from '@radix-ui/colors';

export const PopoverContent = styled(PopoverPrimitive.Content, {
  zIndex: '$3',
  borderRadius: '$2',
  padding: '10px 15px',
  fontSize: '$3',
  lineHeight: 1,
  color: '$loContrast',
  backgroundColor: '$hiContrast',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  a: {
    color: blue.blue9,
  },
});
