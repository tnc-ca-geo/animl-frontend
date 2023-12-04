import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
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
  margin: '0 $2',
});

const LoupeDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton css={{ border: 'none' }}>
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        <DropdownMenuItem>
          Delete Image
        </DropdownMenuItem>
        <DropdownMenuArrow offset={12} />

      </DropdownMenuContent>
    </DropdownMenu>
  )
};

export default LoupeDropdown;