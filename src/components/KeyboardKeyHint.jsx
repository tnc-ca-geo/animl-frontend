import { styled } from '../theme/stitches.config';

export const KeyboardKeyHint = styled('span', {
  display: 'inline-block',
  padding: '3px 5px',
  font: '$mono',
  lineHeight: '9px',
  height: '20px',
  color: '$textDark',
  backgroundColor: '$backgroundDark',
  verticalAlign: 'middle',
  border: 'solid 1px $border',
  borderRadius: '6px',
  boxShadow: 'inset 0 -1px 0 $border',
});
