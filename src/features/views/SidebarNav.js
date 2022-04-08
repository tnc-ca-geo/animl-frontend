import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectSelectedProject, selectSelectedView } from '../projects/projectsSlice';
import Modal from '../../components/Modal';
import IconButton from '../../components/IconButton';
import CameraAdminModal from '../cameras/CameraAdminModal';
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
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '$9',
  borderRight: '1px solid $gray400',
});

const SidebarNav = ({ view, toggleFiltersPanel, filtersPanelOpen }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState();
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);

  const handleModalToggle = (content) => {
    setModalOpen(!modalOpen);
    setModalContent(content);
  };

  return (
    <StyledSidebarNav>
      <MenuButton
        variant='ghost'
        state={filtersPanelOpen ? 'active' : ''}
        onClick={toggleFiltersPanel}>
        <FontAwesomeIcon icon={['fas', 'filter']} />
      </MenuButton>

      {/*
      <MenuButton variant='ghost'>
        <FontAwesomeIcon icon={['fas', 'cog']} />
      </MenuButton>
      */}

      <MenuButton
        variant='ghost'
        disabled={!selectedProject}
        state={modalOpen && (modalContent === 'camera-admin-modal') 
          ? 'active' 
          : ''
        }
        onClick={() => handleModalToggle('camera-admin-modal')}
      >
        <FontAwesomeIcon icon={['fas', 'camera']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'camera-admin-modal')) &&
        <Modal 
          handleClose={handleModalToggle}
          title='Manage Cameras'
          size='md'
        >
          <CameraAdminModal/>
        </Modal>
      }

      <MenuButton
        variant='ghost'
        disabled={!selectedView}
        state={modalOpen && (modalContent === 'automation-rules-form') 
          ? 'active' 
          : ''
        }
        onClick={() => handleModalToggle('automation-rules-form')}
      >
        <FontAwesomeIcon icon={['fas', 'robot']} />
      </MenuButton>
      {(modalOpen && (modalContent === 'automation-rules-form')) &&
        <Modal 
          handleClose={handleModalToggle}
          title='Automation Rules'
          size='md'
        >
          <AutomationRulesForm/>
        </Modal>
      }

      <MenuButton
        variant='ghost'
        disabled={!selectedView}
        state={modalOpen && (modalContent === 'save-view-form') 
          ? 'active' 
          : ''
        }
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
        disabled={!selectedView || !selectedView.editable}
        state={modalOpen && (modalContent === 'delete-view-form') 
          ? 'active' 
          : ''
        }
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
