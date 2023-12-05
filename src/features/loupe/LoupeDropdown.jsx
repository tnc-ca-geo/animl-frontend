import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { deleteImages } from '../images/imagesSlice.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuArrow
} from '../../components/Dropdown.jsx';
import IconButton from '../../components/IconButton.jsx';
import { HamburgerMenuIcon, DotFilledIcon, DotsHorizontalIcon} from '@radix-ui/react-icons';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  position: 'absolute',
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = ({ image }) => {
  const dispatch = useDispatch();

  const handleDeleteImageItemClick = () => {
    dispatch(deleteImages([image._id]));
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
    </DropdownMenu>
  )
};

export default LoupeDropdown;