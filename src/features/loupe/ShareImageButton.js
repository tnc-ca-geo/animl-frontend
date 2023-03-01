import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Label from '@radix-ui/react-label';
import { ClipboardCopyIcon } from '@radix-ui/react-icons';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastViewport
} from '../../components/Toast';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip';
import { selectSelectedProject } from '../projects/projectsSlice'
import { copyUrlToClipboard } from './loupeSlice';
import IconButton from '../../components/IconButton';
import { truncateString } from '../../app/utils';

const StyledLabel = styled(Label.Root, {
  fontSize: '$2',
  fontWeight: '$3',
  marginRight: '$3',
  textTransform: 'uppercase'
});

const StyledURLInput = styled('input', {
  fontFamily: '$mono',
  fontSize: '$2',
  border: '1px solid $border',
  borderRadius: '$1',
  color: '$textMedium',
  marginRight: '$1',
});

const ShareImageButton = ({ imageId }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const allImagesView = selectedProject.views.find((v) => v.name === 'All images');
  const baseUrl = `https://animl.camera/app`;
  const shareURL = `${baseUrl}/${selectedProject._id}/${allImagesView._id}?img=${imageId}`;
  const dispatch = useDispatch();

  const [ showToast, setShowToast ] = useState(false);
  const handleCopyToClipboard = () => {
    dispatch(copyUrlToClipboard(shareURL));
    setShowToast(true);
  };

  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <StyledLabel htmlFor="shareURL">Share: </StyledLabel>
      <StyledURLInput type="text" id="shareURL" readonly="readonly" defaultValue={shareURL} />
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton 
            variant='ghost'
            onClick={handleCopyToClipboard}
          >
            <ClipboardCopyIcon/>
          </IconButton>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={5} >
          Copy URL to clipboard
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      <Toast
        open={showToast}
        duration={2000}
        onOpenChange={(e) => setShowToast(false)}
      >
        <ToastTitle variant="green" css={{ marginBottom: 0 }}>
          URL copied to clipboard
        </ToastTitle>
        <ToastDescription asChild>
          <div>{truncateString(shareURL, 40)}</div>
        </ToastDescription>
        <ToastAction asChild altText="Dismiss">
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'times']}/>
          </IconButton>
        </ToastAction>
      </Toast>
      <ToastViewport />
    </div>
  );
};

export default ShareImageButton;
