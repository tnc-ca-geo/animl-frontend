import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow
} from '../../components/Dropdown.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DotsHorizontalIcon} from '@radix-ui/react-icons';
import DeleteImagesAlert from './DeleteImagesAlert.jsx';
import { setDeleteImagesAlertOpen } from '../images/imagesSlice';
import { editComment } from '../review/reviewSlice';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  position: 'absolute',
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = ({ image }) => {
  const dispatch = useDispatch();
  
  const handleDeleteImageItemClick = () => {
    dispatch(setDeleteImagesAlertOpen(true));
  };

  // NOTE: just testing image.comments CRUD operations
  const handleCreateCommentItemClick = () => {
    const comment = 'TEST COMMENT 4';
    dispatch(editComment('create', { comment, imageId: image._id }));
  };

  const handleUpdateCommentItemClick = () => {
    const _id = '6582030e05256f8bff29ba43';
    const comment = 'UPDATED COMMENT 4';
    dispatch(editComment('update', { comment, id: _id, imageId: image._id }));
  };

  const handleDeleteCommentItemClick = () => {
    const _id = '6582030e05256f8bff29ba43';
    dispatch(editComment('delete', { id: _id, imageId: image._id }));
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
        <DropdownMenuItem onClick={handleCreateCommentItemClick}>
          Create Comment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleUpdateCommentItemClick}>
          Update Comment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteCommentItemClick}>
          Delete Comment
        </DropdownMenuItem>
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>

      {/* Alerts */}
      <DeleteImagesAlert imgIds={[image._id]} />
    </DropdownMenu>
  )
};

export default LoupeDropdown;