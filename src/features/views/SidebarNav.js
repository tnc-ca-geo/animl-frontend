import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { selectSelectedView } from './viewsSlice';
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

      {/*
      <MenuButton variant='ghost'>
        <FontAwesomeIcon icon={['fas', 'cog']} />
      </MenuButton>
      */}

      <MenuButton
        variant='ghost'
        disabled={!selectedView}
        onClick={() => handleModalToggle('automation-rules-form')}
      >
        <FontAwesomeIcon icon={['fas', 'robot']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'automation-rules-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          title='Automation Rules'
          size='sm'
        >
          <AutomationRulesForm/>
        </Modal>
      }

      <MenuButton
        variant='ghost'
        css={{ 
          '@keyframes rotate': {
            'to': {
              transform: 'rotate(360deg)'
            }
          },
          animation: 'rotate 1s infinite linear',
         }}
        onClick={() => handleModalToggle('save-view-form')}
      >
        <FontAwesomeIcon icon={['fas', 'save']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'save-view-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          title='Save View'
          size='sm'
        >
          <SaveViewForm/>
        </Modal>
      }
      
      <MenuButton
        variant='ghost'
        disabled={selectedView && !selectedView.editable}
        onClick={() => handleModalToggle('delete-view-form')}
      >
        <FontAwesomeIcon icon={['fas', 'trash-alt']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'delete-view-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          title='Delete View'
          size='sm'
        >
          <DeleteViewForm/>
        </Modal>
      }

      {/*
      <MenuButton variant='ghost'>
          <FontAwesomeIcon icon={['fas', 'redo']} />
      </MenuButton>
      */}
      

    </StyledSidebarNav>
  );
};

export default SidebarNav;
