import { styled } from '@stitches/react';
import { indigo } from '@radix-ui/colors';

const ProgressBar = styled('progress', {
  width: '100%',
  backgroundColor: indigo.indigo5,
  '&::-moz-progress-bar': {
    backgroundColor: indigo.indigo11,
  },
  '&::-webkit-progress-bar': {
    backgroundColor: indigo.indigo5,
  },
  '&::-webkit-progress-value': {
    backgroundColor: indigo.indigo11,
  }
});

export default ProgressBar;
