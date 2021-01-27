import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectSelectedView } from './filtersSlice';
import Modal from '../../components/Modal';
import IconButton from '../../components/IconButton';
import AutomationRulesForm from './AutomationRulesForm';
import SaveViewForm from './SaveViewForm';
import DeleteViewForm from './DeleteViewForm';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState();
  const selectedView = useSelector(selectSelectedView);

  const handleModalToggle = (content) => {
    setModalOpen(!modalOpen);
    setModalContent(content);
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
        disabled={!selectedView || !selectedView.editable}
        onClick={() => handleModalToggle('automation-rules-form')}
      >
        <FontAwesomeIcon icon={['fas', 'robot']} />
      </MenuButton>
      <MenuButton
        variant='ghost'
        onClick={() => handleModalToggle('save-view-form')}
      >
        <FontAwesomeIcon icon={['fas', 'save']} />
      </MenuButton>
      <MenuButton
        variant='ghost'
        disabled={selectedView && !selectedView.editable}
        onClick={() => handleModalToggle('delete-view-form')}
      >
        <FontAwesomeIcon icon={['fas', 'trash-alt']} />
      </MenuButton>
      <MenuButton variant='ghost'>
        <FontAwesomeIcon icon={['fas', 'redo']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'automation-rules-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          header='Automation Rules'
          size='sm'
        >
          <AutomationRulesForm/>
        </Modal>
      }
      {(modalOpen && (modalContent === 'save-view-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          header='Save View'
          size='sm'
        >
          <SaveViewForm/>
        </Modal>
      }
      {(modalOpen && (modalContent === 'delete-view-form')) &&
      <Modal 
        handleClose={handleModalToggle}
        header='Delete View'
        size='sm'
      >
        <DeleteViewForm/>
      </Modal>
    }
    </StyledSidebarNav>
  );
};

export default SidebarNav;
