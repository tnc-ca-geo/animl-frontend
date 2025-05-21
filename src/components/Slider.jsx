import { styled } from '@stitches/react';
import * as Slider from '@radix-ui/react-slider';

const StyledRoot = styled(Slider.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: '20px',
  '&[data-disabled]': {
    pointerEvents: 'none',
  },
});

const StyledTrack = styled(Slider.Track, {
  backgroundColor: '$gray6',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '9999px',
  height: 2,
  '&[data-disabled]': {
    backgroundColor: '$gray4',
    pointerEvents: 'none',
  },
});

const StyledRange = styled(Slider.Range, {
  position: 'absolute',
  backgroundColor: '$hiContrast',
  borderRadius: 9999,
  height: '100%',
  '&[data-disabled]': {
    backgroundColor: '$gray4',
    pointerEvents: 'none',
  },
});

const StyledThumb = styled(Slider.Thumb, {
  display: 'block',
  width: '12px',
  height: '12px',
  backgroundColor: '$hiContrast',
  color: '$loContrast',
  border: '3px solid white',
  boxShadow: '0 2px 10px $black',
  borderRadius: '10px',
  cursor: 'grab',
  '&:hover': {
    backgroundColor: '$gray11',
  },
  '&:focus': {
    outline: 'none',
    boxShadow: '0 0 0 5px $black',
  },
  '&[data-disabled]': {
    backgroundColor: '$gray4',
    pointerEvents: 'none',
  },
});

// exports
export const SliderRoot = StyledRoot;
export const Track = StyledTrack;
export const Range = StyledRange;
export const Thumb = StyledThumb;
