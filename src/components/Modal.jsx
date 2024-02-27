import React from 'react';
import { styled, keyframes } from '@stitches/react';
import { blackA, mauve } from '@radix-ui/colors';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import PanelHeader from './PanelHeader';

const ModalBody = styled('div', {
  padding: '$3',
  maxHeight: 'calc(85vh - $7)',
  overflowY: 'scroll',
});

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

// const contentShow = keyframes({
//   '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
//   '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
// });

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  zIndex: '$4',
  backgroundColor: blackA.blackA9,
  position: 'fixed',
  inset: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
});

const StyledContent = styled(DialogPrimitive.Content, {
  zIndex: '$5',
  backgroundColor: '$backgroundLight',
  borderRadius: '$2',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxHeight: '85vh',
  '&:focus': { outline: 'none' },

  variants: {
    size: {
      sm: {
        width: '30vw',
        minWidth: '430px',
      },
      md: {
        width: '60vw',
      },
      lg: {
        width: '95vw',
        // height: '95vh',
      },
    },
  },
});

function Content({ children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <StyledOverlay />
      <StyledContent {...props}>{children}</StyledContent>
    </DialogPrimitive.Portal>
  );
}

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontWeight: 500,
  color: mauve.mauve12,
  fontSize: 17,
});

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: '10px 0 20px',
  color: mauve.mauve11,
  fontSize: 15,
  lineHeight: 1.5,
});

// Exports
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = Content;
export const DialogTitle = StyledTitle;
export const DialogDescription = StyledDescription;
export const DialogClose = DialogPrimitive.Close;

export const Modal = ({ open, handleModalToggle, size, title, children }) => (
  <Dialog open={open} onOpenChange={() => handleModalToggle()}>
    <DialogContent size={size}>
      <PanelHeader title={title} handlePanelClose={handleModalToggle} />
      <ModalBody>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            open: open,
            handleClose: handleModalToggle,
          }),
        )}
      </ModalBody>
    </DialogContent>
  </Dialog>
);
