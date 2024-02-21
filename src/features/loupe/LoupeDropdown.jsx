import React from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import DeleteImagesAlert from './DeleteImagesAlert.jsx';
import { setDeleteImagesAlertOpen } from '../images/imagesSlice';

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

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger asChild>
        <IconButton variant="ghost">
          <DotsHorizontalIcon />
        </IconButton>
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        <DropdownMenuItem onClick={handleDeleteImageItemClick}>Delete Image</DropdownMenuItem>
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>

      {/* Alerts */}
      <DeleteImagesAlert imgIds={[image._id]} />
    </DropdownMenu>
  );
};

export default LoupeDropdown;
