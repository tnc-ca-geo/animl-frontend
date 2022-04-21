import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  setModalOpen,
  selectSelectedProject,
  selectSelectedView,
  selectModalOpen,
} from '../projects/projectsSlice';
import Modal from '../../components/Modal';
import CameraAdminModal from '../cameras/CameraAdminModal';
import AutomationRulesForm from './AutomationRulesForm';
import SaveViewForm from './SaveViewForm';
import DeleteViewForm from './DeleteViewForm';
import SidebarNavItem from './SidebarNavItem';


const StyledSidebarNav = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '$9',
  borderRight: '1px solid $gray400',
});

const modalContentMap = {
  'camera-admin-modal': {
    title: 'Manage Cameras',
    size: 'md',
    content: <CameraAdminModal/>,
  },
  'automation-rules-form': {
    title: 'Configure Automation Rules',
    size: 'md',
    content: <AutomationRulesForm/>,
  },
  'save-view-form': {
    title: 'Save View',
    size: 'sm',
    content: <SaveViewForm/>,
  },
  'delete-view-form': {
    title: 'Delete View',
    size: 'sm',
    content: <DeleteViewForm/>,
  },
};

const SidebarNav = ({ view, toggleFiltersPanel, filtersPanelOpen }) => {
  const [modalContent, setModalContent] = useState();
  const modalOpen = useSelector(selectModalOpen);
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  const handleModalToggle = (content) => {
    dispatch(setModalOpen(!modalOpen));
    setModalContent(content);
  };

  return (
    <StyledSidebarNav>

      {/* filters */}
      <SidebarNavItem 
        state={filtersPanelOpen ? 'active' : ''}
        disabled={false}
        handleClick={toggleFiltersPanel}
        icon={<FontAwesomeIcon icon={['fas', 'filter']} />}
        tooltipContent='Filter images'
      />

      {/* camera admin */}
      <SidebarNavItem 
        state={modalOpen && (modalContent === 'camera-admin-modal') 
          ? 'active' 
          : ''
        }
        disabled={!selectedProject}
        handleClick={() => handleModalToggle('camera-admin-modal')}
        icon={<FontAwesomeIcon icon={['fas', 'camera']} />}
        tooltipContent='Manage cameras'
      />

      {/* configure automation rules */}
      <SidebarNavItem 
        state={modalOpen && (modalContent === 'automation-rules-form') 
          ? 'active' 
          : ''
        }
        disabled={!selectedProject}
        handleClick={() => handleModalToggle('automation-rules-form')}
        icon={<FontAwesomeIcon icon={['fas', 'robot']} />}
        tooltipContent='Configure automation'
      />

      {/* save view */}
      <SidebarNavItem 
        state={modalOpen && (modalContent === 'save-view-form') ? 'active' : ''}
        disabled={!selectedView}
        handleClick={() => handleModalToggle('save-view-form')}
        icon={<FontAwesomeIcon icon={['fas', 'save']} />}
        tooltipContent='Save view'
      />
      
      {/* delete view */}
      <SidebarNavItem 
        state={modalOpen && (modalContent === 'delete-view-form') ? 'active' : ''}
        disabled={!selectedView || !selectedView.editable}
        handleClick={() => handleModalToggle('delete-view-form')}
        icon={<FontAwesomeIcon icon={['fas', 'trash-alt']} />}
        tooltipContent='Delete view'
      />
      
      {modalOpen &&
        <Modal 
          handleClose={handleModalToggle}
          title={modalContentMap[modalContent].title}
          size={modalContentMap[modalContent].size}
        >
          {modalContentMap[modalContent].content}
        </Modal>
      }

    </StyledSidebarNav>
  );
};

export default SidebarNav;
