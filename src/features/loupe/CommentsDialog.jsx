import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CommentsContent } from './CommentsContent.jsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectMobileCommentFocusIndex,
  selectWorkingImages,
  setMobileCommentFocusIndex,
} from '../review/reviewSlice.js';
import { X } from 'lucide-react';
import {
  BottomUpMenuClosePanelButton,
  BottomUpMenuContent,
  BottomUpMenuOverlay,
} from '../../components/BottomUpMenu.jsx';

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
          <BottomUpMenuContent onPointerDownOutside={() => handleClose()}>
            {image && (
              <CommentsContent
                comments={image.comments}
                imageId={image._id}
                closeContent={
                  <BottomUpMenuClosePanelButton variant="ghost" onClick={() => handleClose()}>
                    <X />
                  </BottomUpMenuClosePanelButton>
                }
              />
            )}
          </BottomUpMenuContent>
          <BottomUpMenuOverlay />
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
