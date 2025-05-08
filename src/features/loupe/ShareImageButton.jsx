import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import * as Label from '@radix-ui/react-label';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastViewport,
} from '../../components/Toast';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip';
import { selectSelectedProject } from '../projects/projectsSlice';
import { copyUrlToClipboard } from './loupeSlice';
import IconButton from '../../components/IconButton';
import { ClipboardCopyIcon, Cross2Icon } from '@radix-ui/react-icons';
import { truncateString } from '../../app/utils';

const StyledLabel = styled(Label.Root, {
  fontSize: '$2',
  fontWeight: '$3',
  marginRight: '$3',
  textTransform: 'uppercase',
  display: 'none',
  '@bp1': {
    display: 'unset',
  },
});

const StyledURLInput = styled('input', {
  fontFamily: '$mono',
  fontSize: '$2',
  border: '1px solid $border',
  borderRadius: '$1',
  color: '$textMedium',
  marginRight: '$1',
  padding: '0 $2',
  display: 'none',
  '@bp1': {
    display: 'unset',
  },
});

const StyledIconButton = styled(IconButton, {
  borderRadius: 4,
  '@bp1': {
    borderRadius: '$round',
  },
});

const ShareImageButton = ({ imageId }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const allImagesView = selectedProject.views.find((v) => v.name === 'All images');
  const shareURL = `${window.location.origin}/app/${selectedProject._id}/${allImagesView._id}?img=${imageId}`;
  const dispatch = useDispatch();

  const [showToast, setShowToast] = useState(false);
  const handleCopyToClipboard = () => {
    dispatch(copyUrlToClipboard(shareURL));
    setShowToast(true);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <StyledLabel htmlFor="shareURL">Share: </StyledLabel>
      <StyledURLInput type="text" id="shareURL" readOnly={true} value={shareURL} />
      <Tooltip>
        <TooltipTrigger asChild>
          <StyledIconButton variant="ghost" onClick={handleCopyToClipboard}>
            <ClipboardCopyIcon />
          </StyledIconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={5}>
          Copy URL to clipboard
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      <Toast open={showToast} duration={2000} onOpenChange={() => setShowToast(false)}>
        <ToastTitle variant="green" css={{ marginBottom: 0 }}>
          URL copied to clipboard
        </ToastTitle>
        <ToastDescription asChild>
          <div>{truncateString(shareURL, 40)}</div>
        </ToastDescription>
        <ToastAction asChild altText="Dismiss">
          <IconButton variant="ghost">
            <Cross2Icon />
          </IconButton>
        </ToastAction>
      </Toast>
      <ToastViewport />
    </div>
  );
};

export default ShareImageButton;
