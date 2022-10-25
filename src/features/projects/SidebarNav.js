import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserCurrentRoles } from '../user/userSlice';
import {
  hasRole,
  WRITE_AUTOMATION_RULES_ROLES,
  WRITE_VIEWS_ROLES,
} from '../../auth/roles';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  setModalOpen,
  setModalContent,
  selectSelectedProject,
  selectSelectedView,
  selectModalOpen,
  selectModalContent,
} from '../projects/projectsSlice';
import SidebarNavItem from './SidebarNavItem';


const StyledSidebarNav = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '$9',
  borderRight: '1px solid $border',
  backgroundColor: '$backgroundLight',
});

const SidebarNav = ({ view, toggleFiltersPanel, filtersPanelOpen }) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const modalOpen = useSelector(selectModalOpen);
  const modalContent = useSelector(selectModalContent);
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  const handleModalToggle = (content) => {
    dispatch(setModalOpen(!modalOpen));
    dispatch(setModalContent(content));
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
      {hasRole(userRoles, WRITE_AUTOMATION_RULES_ROLES) &&
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
      }

      {/* save view */}
      {hasRole(userRoles, WRITE_VIEWS_ROLES) &&
        <SidebarNavItem 
          state={modalOpen && (modalContent === 'save-view-form') ? 'active' : ''}
          disabled={!selectedView}
          handleClick={() => handleModalToggle('save-view-form')}
          icon={<FontAwesomeIcon icon={['fas', 'save']} />}
          tooltipContent='Save view'
        />
      }
      
      {/* delete view */}
      {hasRole(userRoles, WRITE_VIEWS_ROLES) &&
        <SidebarNavItem 
          state={modalOpen && (modalContent === 'delete-view-form') ? 'active' : ''}
          disabled={!selectedView || !selectedView.editable}
          handleClick={() => handleModalToggle('delete-view-form')}
          icon={<FontAwesomeIcon icon={['fas', 'trash-alt']} />}
          tooltipContent='Delete view'
        />
      }

    </StyledSidebarNav>
  );
};

export default SidebarNav;
