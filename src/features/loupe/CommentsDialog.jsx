import React, { useState } from 'react';
import { styled, keyframes } from '../../theme/stitches.config.js';
import * as Dialog from '@radix-ui/react-dialog';
import { CommentsContent } from './CommentsContent.jsx';
import { indigo } from '@radix-ui/colors';
import { ToolbarIconButton } from './ImageReviewToolbar.jsx';
import { ChatBubbleIcon } from '@radix-ui/react-icons';

const Badge = styled('div', {
  position: 'absolute',
  top: 1,
  left: 18,
  background: indigo.indigo4,
  fontSize: '$1',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $1',
  borderRadius: '$2',
});

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

export const CommentsDialog = ({
  image,
  userRoles,
}) => {
  const [isCommentsActionMenuOpen, setIsCommentsActionMenuOpen] = useState(false);

  console.log(userRoles, isCommentsActionMenuOpen)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <ToolbarIconButton 
          css={{ position: 'relative' }}
        >
          <ChatBubbleIcon />
          {image.comments?.length > 0 && <Badge>{image.comments?.length}</Badge>}
        </ToolbarIconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Content>
          <CommentsContent
            onChangeActionMenu={setIsCommentsActionMenuOpen}
            comments={image.comments}
            imageId={image._id}
          />
        </Content>
        <Overlay />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
