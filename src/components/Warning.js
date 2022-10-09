import { styled } from '../theme/stitches.config';
import { red } from '@radix-ui/colors';

export default styled('div', {
  color: red.red11,
  background: red.red1,
  padding: '$2 $3',
  margin: '$2 $3 $3 $3',
  borderRadius: '$2',
  border: '1px solid',
  borderColor: red.red11,
});
