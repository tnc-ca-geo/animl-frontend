import * as Switch from '@radix-ui/react-switch';
import { styled } from '../theme/stitches.config.js';
import { blackA } from '@radix-ui/colors';

export const SwitchRoot = styled(Switch.Root, {
  all: 'unset',
  width: 42,
  height: 25,
  backgroundColor: blackA.blackA6,
  borderRadius: '9999px',
  position: 'relative',
  // boxShadow: `0 2px 10px ${blackA.blackA4}`,
  border: '1px solid',
  borderColor: '$border',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    // borderColor: '$textDark',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '&[data-state="checked"]': { backgroundColor: 'black' },
});

export const SwitchThumb = styled(Switch.Thumb, {
  display: 'block',
  width: 21,
  height: 21,
  backgroundColor: 'white',
  borderRadius: '9999px',
  boxShadow: `0 2px 2px ${blackA.blackA4}`,
  transition: 'transform 100ms',
  transform: 'translateX(2px)',
  willChange: 'transform',
  '&[data-state="checked"]': { transform: 'translateX(19px)' },
});