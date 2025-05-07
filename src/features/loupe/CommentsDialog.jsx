import React, { useEffect, useState } from 'react';
import { styled, keyframes } from '../../theme/stitches.config.js';
import * as Dialog from '@radix-ui/react-dialog';
import { CommentsContent } from './CommentsContent.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMobileCommentFocusIndex,
  selectWorkingImages,
  setMobileCommentFocusIndex,
} from '../review/reviewSlice.js';
import IconButton from '../../components/IconButton.jsx';
import { X } from 'lucide-react';

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

const Content = styled(Dialog.Content, {
  zIndex: '$6',
  width: '100vw',
  height: '80dvh',
  position: 'fixed',
  left: 0,
  top: '20dvh',
  borderRadius: '$3 $3 0 0',
  backgroundColor: '$backgroundLight',
  '&:focus': { outline: 'none' },
  transformOrigin: 'top right',
  ...animateMenuOpenClose,
});

const Overlay = styled(Dialog.Overlay, {
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

const ClosePanelButton = styled(IconButton, {
  borderRadius: '$2',
  marginLeft: 'auto',
});

export const CommentsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const workingImages = useSelector(selectWorkingImages);
  const commentFocusIdx = useSelector(selectMobileCommentFocusIndex);
  const dispatch = useDispatch();

  const image = workingImages.find((img) => img._id === commentFocusIdx);

  useEffect(() => {
    setIsOpen(commentFocusIdx !== null && commentFocusIdx !== undefined);
  }, [commentFocusIdx]);

  const handleClose = () => {
    setIsOpen(false);
    dispatch(setMobileCommentFocusIndex(null));
  };

  return (
    <>
      <Dialog.Root open={isOpen}>
        <Dialog.Portal>
          <Content onPointerDownOutside={() => handleClose()}>
            {image && (
              <CommentsContent
                comments={image.comments}
                imageId={image._id}
                closeContent={
                  <ClosePanelButton variant="ghost" onClick={() => handleClose()}>
                    <X />
                  </ClosePanelButton>
                }
              />
            )}
          </Content>
          <Overlay />
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
