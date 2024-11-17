import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import { selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, DELETE_IMAGES_ROLES, EXPORT_DATA_ROLES } from '../auth/roles.js';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { setDeleteImagesAlertStatus } from '../images/imagesSlice';

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  height: '100%',
  width: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  padding: '0',
});

const FiltersPanelFooterDropdown = (props) => {
  const dispatch = useDispatch();
  const userRoles = useSelector(selectUserCurrentRoles);

  const handleDeleteImageItemClick = () => {
    dispatch(setDeleteImagesAlertStatus({ openStatus: true, deleteImagesByFilter: true }));
  };

  return (
    <DropdownMenu>
      <StyledDropdownMenuTrigger size="large">
        <DotsHorizontalIcon />
      </StyledDropdownMenuTrigger>
      <DropdownMenuContent sideOffset={5}>
        {hasRole(userRoles, EXPORT_DATA_ROLES) && (
          <DropdownMenuItem onClick={() => props.handleModalToggle('export-modal')}>
            Export filtered data
          </DropdownMenuItem>
        )}
        {hasRole(userRoles, DELETE_IMAGES_ROLES) && (
          <DropdownMenuItem onClick={handleDeleteImageItemClick}>
            Delete filtered images
          </DropdownMenuItem>
        )}
        <DropdownMenuArrow offset={12} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FiltersPanelFooterDropdown;
