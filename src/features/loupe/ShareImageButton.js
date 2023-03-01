import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import IconButton from '../../components/IconButton';

import * as Label from '@radix-ui/react-label';
import { ClipboardIcon } from '@radix-ui/react-icons';
import {
  selectSelectedProject
} from '../projects/projectsSlice'


// const StyledShareImageButton = styled(Button, {
//   color: 'red'
// });

const StyledShareImageButton = styled('Button', {
  border: 'none',
  backgroundColor: '$gray3',
  borderRadius: '$3',
  padding: '$1 $3',
  color: '$textMedium',
  marginLeft: '$2',
  textTransform: 'uppercase',
  fontSize: '$2',
  fontWeight: '600',
  '&:hover': {
    color: '$textDark',
    backgroundColor: '$gray4',
    cursor: 'pointer',
  },
  '&:active': {
    backgroundColor: '$gray5',
  },
});

const ShareImageButton = ({ imageId }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const allImagesView = selectedProject.views.find((v) => v.name === 'All images');
  const shareURL = `https://animl.camera/app/${selectedProject._id}/${allImagesView._id}?img=${imageId}`;

  const handleCopyToClipboard = (e) => {
    console.log('copying to clipboard: ', e)
  };


  return (
    <div
      style={{ display: 'flex', padding: '0 20px', flexWrap: 'wrap', gap: 15, alignItems: 'center' }}
    >
      <Label.Root className="LabelRoot" htmlFor="shareUrl">Share</Label.Root>
      <input className="Input" type="text" id="shareUrl" readonly="readonly" defaultValue={shareURL} />
      <IconButton 
        variant='ghost'
        onClick={handleCopyToClipboard}
      >
        <ClipboardIcon/>
      </IconButton>
    </div>
  );
};

export default ShareImageButton;
