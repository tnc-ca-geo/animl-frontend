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
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = () => {
  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger asChild>
        <IconButton variant='ghost' css={{ border: 'none' }}>
          <DotsHorizontalIcon />
        </IconButton>
      </StyledDropdownMenuTrigger>
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