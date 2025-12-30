import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLeft,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import IconButton from '../../components/IconButton.jsx';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import DeleteImagesAlert from '../images/DeleteImagesAlert.jsx';
import { setDeleteImagesAlertStatus } from '../images/imagesSlice';
import { selectFocusIndex, setSelectedImageIndices } from '../review/reviewSlice.js';
import { setModalOpen, setModalContent } from '../projects/projectsSlice.js';
import { Trash2, Clock } from 'lucide-react';
import { ENABLE_TIMESTAMP_OFFSET } from '../../config';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  position: 'absolute',
  right: 0,
  margin: '0 $2',
});

const LoupeDropdown = ({ image }) => {
  const dispatch = useDispatch();
  const focusIndex = useSelector(selectFocusIndex);

  const handleDeleteImageItemClick = () => {
    dispatch(setSelectedImageIndices([focusIndex.image]));
    dispatch(setDeleteImagesAlertStatus({ openStatus: true, deleteImagesByFilter: false }));
  };

  const handleEditTimestampClick = () => {
    dispatch(setModalOpen(true));
    dispatch(setModalContent('edit-image-timestamp-form'));
  };

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger asChild>
        <IconButton variant="ghost">
          <DotsHorizontalIcon />
        </IconButton>
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        {ENABLE_TIMESTAMP_OFFSET && (
          <DropdownMenuItem onSelect={handleEditTimestampClick}>
            <DropdownMenuItemIconLeft>
              <Clock size={15} />
            </DropdownMenuItemIconLeft>
            Edit Image Timestamp
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleDeleteImageItemClick}>
          <DropdownMenuItemIconLeft>
            <Trash2 size={15} />
          </DropdownMenuItemIconLeft>
          Delete Image
        </DropdownMenuItem>
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>

      {/* Alerts */}
      <DeleteImagesAlert imgIds={[image._id]} />
    </DropdownMenu>
  );
};

export default LoupeDropdown;
