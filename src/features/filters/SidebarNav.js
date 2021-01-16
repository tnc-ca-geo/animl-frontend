import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
import SaveViewModal from './SaveViewModal';

const MenuButton = styled(IconButton, {
  fontSize: '$4',
  margin: '$2',
  borderRadius: '$2',
});

const StyledSidebarNav = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '$9',
  borderRight: '$1 solid $gray400',
});

const SidebarNav = ({ view }) => {
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const handleSaveModalToggle = () => {
    setSaveModalOpen(!saveModalOpen);
  };

  return (
    <StyledSidebarNav>
      <MenuButton variant='ghost' state='active'>
        <FontAwesomeIcon icon={['fas', 'filter']} />
      </MenuButton>
      <MenuButton variant='ghost'>
        <FontAwesomeIcon icon={['fas', 'cog']} />
      </MenuButton>
      <MenuButton
        variant='ghost'
        onClick={handleSaveModalToggle}
      >
        <FontAwesomeIcon icon={['fas', 'save']} />
      </MenuButton>
      <MenuButton variant='ghost'>
        <FontAwesomeIcon icon={['fas', 'redo']} />
      </MenuButton>
      {saveModalOpen &&
        <SaveViewModal
          handleClose={handleSaveModalToggle}
        />
      }
    </StyledSidebarNav>
  );
};

export default SidebarNav;
