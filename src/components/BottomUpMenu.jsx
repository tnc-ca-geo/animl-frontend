import { styled, keyframes } from '../theme/stitches.config';
import * as Dialog from '@radix-ui/react-dialog';
import IconButton from './IconButton';
import Button from './Button';

const openOverlayAnimation = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const closeOverlayAnimation = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const animateOverlayOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${openOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
    '&[data-state="closed"]': {
      animation: `${closeOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

const openMenuAnimation = keyframes({
  from: { transform: 'translateY(80dvh)' },
  to: { transform: 'translateY(0)' },
});

const closeMenuAnimation = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(80dvh)' },
});

const animateMenuOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': { animation: `${openMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)` },
    '&[data-state="closed"]': {
      animation: `${closeMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

export const BottomUpMenuContent = styled(Dialog.Content, {
  zIndex: '$6',
  width: '100vw',
  height: '80dvh',
  position: 'fixed',
  overflow: 'hidden',
  left: 0,
  top: '20dvh',
  borderRadius: '$3 $3 0 0',
  backgroundColor: '$backgroundLight',
  '&:focus': { outline: 'none' },
  transformOrigin: 'top right',
  ...animateMenuOpenClose,
});

export const BottomUpMenuOverlay = styled(Dialog.Overlay, {
  zIndex: '$4',
  position: 'fixed',
  height: '100dvh',
  width: '100vw',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0,0,0,.8)',
  ...animateOverlayOpenClose,
});

export const BottomUpMenuClosePanelButton = styled(IconButton, {
  borderRadius: '$2',
  marginLeft: 'auto',
});

export const BottomUpMenuHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  borderTopLeftRadius: '$3',
  borderTopRightRadius: '$3',
  '@bp1': {
    borderTopLeftRadius: '$2',
    borderTopRightRadius: '$2',
  },
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
  padding: '$0 $3',
  minHeight: '$7',
  position: 'relative',
});

export const BottomUpMenuTextArea = styled('textarea', {
  resize: 'none',
  width: '100%',
  rows: '2',
  color: '$textDark',
  marginBottom: '$3',
  fontSize: '$3',
  fontWeight: '$2',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  padding: '$2',
  '@bp2': {
    padding: '$3',
  },
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

export const BottomUpInput = styled('input', {
  resize: 'none',
  width: '100%',
  color: '$textDark',
  marginBottom: '$3',
  fontSize: '$3',
  fontWeight: '$2',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  padding: '$2',
  '@bp2': {
    padding: '$3',
  },
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
});

export const BottomUpMenuButton = styled(Button, {
  marginLeft: 'auto',
  marginRight: '0',
  width: '100%',
  '@bp1': {
    width: 'unset',
    fontSize: '$2',
    paddingLeft: '$3',
    paddingRight: '$3',
  },
});
