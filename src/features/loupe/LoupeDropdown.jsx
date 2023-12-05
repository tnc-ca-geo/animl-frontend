import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { deleteImages } from '../images/imagesSlice.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow
} from '../../components/Dropdown.jsx';
import { Alert, AlertPortal, AlertOverlay, AlertContent, AlertTitle } from '../../components/AlertDialog';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import { DotsHorizontalIcon} from '@radix-ui/react-icons';
import { red, mauve } from '@radix-ui/colors';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  position: 'absolute',
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = ({ image }) => {
  const [ alertOpen, setAlertOpen ] = useState(false);

  const handleDeleteImageItemClick = () => {
    setAlertOpen(true);
  };

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger asChild>
        <IconButton variant='ghost'>
          <DotsHorizontalIcon />
        </IconButton>
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        <DropdownMenuItem onClick={handleDeleteImageItemClick}>
          Delete Image
        </DropdownMenuItem>
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>

      {/* Alerts */}
      <DeleteImageAlert
        open={alertOpen}
        setAlertOpen={setAlertOpen}
        imgId={image._id}
      />
    </DropdownMenu>
  )
};


const DeleteImageAlert = ({ open, setAlertOpen, imgId }) => {
  const dispatch = useDispatch();

  const handleConfirmDelete = () => {
    dispatch(deleteImages([imgId]));
    setAlertOpen(false);
  };

  return (
    <Alert
      open={open}
    >
      <AlertPortal>
        <AlertOverlay/>
        <AlertContent>
          <AlertTitle>Are you sure you'd like to delete this image?</AlertTitle>
          <p>This action can not be undone.</p>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size='small' css={{ border: 'none' }} onClick={() => setAlertOpen(false)}>Cancel</Button>
            <Button
              size='small'
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 }
              }} 
              onClick={handleConfirmDelete}
            >
              Yes, delete image
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  )
};

export default LoupeDropdown;