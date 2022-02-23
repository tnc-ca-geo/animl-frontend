import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
import {
  fetchProjects,
  selectProjects,
  selectSelectedProject,
  selectProjectsLoading,
  selectViews,
  selectSelectedView,
  setSelectedProject,
  setSelectedView,
} from '../projects/projectsSlice';
import { selectAvailLabels, selectFiltersReady } from '../filters/filtersSlice';
import {
  // selectViews,
  // fetchViews,
  // setSelectedView,
  // selectSelectedView,
  selectUnsavedViewChanges,
  // selectViewsLoading,
 } from './viewsSlice';

const ViewMenuItem = styled('li', {
  color: '$hiContrast',
  padding: '$2 $3',
  fontWeight: '$2',
  '&:hover': {
    color: '$blue500',
    backgroundColor: '$blue200',
  },

  variants: {
    selected: {
      true: {
        color: '$blue500',
        backgroundColor: '$blue200',
      }
    }
  }
});

const DropDownMenu = styled('div', {
  position: 'absolute',
  zIndex: '$5',
  width: '250px',
  left: '$0',
  top: '$5',
  background: '$loContrast',
  border: '1px solid $gray400',
  boxShadow: `rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, 
   rgba(22, 23, 24, 0.2) 0px 10px 20px -15px`,
  ul: {
   listStyleType: 'none',
   margin: '$0',
   paddingLeft: '$0',
  }
});

const Crumb = styled('span', {
  color: '$hiContrast',
  paddingRight: '$2',
  '&:last-child': {
    paddingRight: '$1',
  },
  '&:not(:first-child)': {
    paddingLeft: '$2',
  },
  '&:hover': {
    borderColor: '$gray700',
    cursor: 'pointer',
  },
  
  variants: {
    edited: {
      true: {
        color: '$gray500',
        '&::after': {
          // bug with stitches pseudo elements:
          // https://github.com/modulz/stitches/issues/313
          content: "' *'",
        },
      }
    }
  }
});

const SelectedViewCrumb = styled(Crumb, {
  position: 'relative',
  fontWeight: '$4',
});

const Breadcrumbs = styled('div', {
  fontSize: '$4',
  fontWeight: '$2',
  color: '$gray600',
});

const ViewNavigation = styled('div', {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
})

const StyledViewSelector = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  backgroundColor: '$loContrast',
  // zIndex: '$5',
});

// TODO: overhaul this whole thing. It's in WIP state

const ViewSelector = () => {
  console.groupCollapsed('ViewSelector() rendering');
  const projectsLoading = useSelector(selectProjectsLoading);
  console.log('projectsLoading: ', projectsLoading)
  const projects = useSelector(selectProjects);
  console.log('projects: ', projects)
  const selectedProject = useSelector(selectSelectedProject);
  console.log('selectedProject: ', selectedProject)
  const views = useSelector(selectViews);
  console.log('views: ', views)
  const selectedView = useSelector(selectSelectedView);
  console.log('selectedView: ', selectedView)
  const availLabels = useSelector(selectAvailLabels);
  console.groupEnd();

  // const viewsAreLoading = useSelector(selectViewsLoading)
  // const filtersReady = useSelector(selectFiltersReady);
  const unsavedChanges = useSelector(selectUnsavedViewChanges);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!projects.length && !projectsLoading) {
      dispatch(fetchProjects());
    }
  }, [projects, projectsLoading, dispatch]);

  useEffect(() => {
    // Wait for filters and views to load before setting selected view,
    // and don't override user's filter selections if there are unsaved changes
    if (availLabels.ids.length && selectedView && !unsavedChanges) {
      dispatch(setSelectedView(selectedView._id));
    }
  }, [selectedView, availLabels.ids, unsavedChanges, dispatch]);

  useEffect(() => {
    const handleWindowClick = () => { setExpandedMenu(null) };
    expandedMenu 
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [expandedMenu, setExpandedMenu]);

  const handleMenuCrumbClick = (entity) => {
    expandedMenu ? setExpandedMenu(null) : setExpandedMenu(entity);
  };

  const handleProjectMenuItemClick = (e) => {
    const projId = e.target.dataset.projId
    if (projId !== selectedProject._id) dispatch(setSelectedProject(projId));
  }

  const handleViewMenuItemClick = (e) => {
    const viewId = e.target.dataset.viewId
    if (viewId !== selectedView._id) dispatch(setSelectedView(viewId));
  }

  return (
    <StyledViewSelector>
      <ViewNavigation>
        <Breadcrumbs>
          <Crumb>
            <SelectedViewCrumb
              onClick={() => handleMenuCrumbClick('project')}
            >
              {selectedProject ? selectedProject.name : 'Loading projects...'}
              {expandedMenu === 'project' &&
                <DropDownMenu>
                  <ul>
                    {projects.map((proj) => (
                      <ViewMenuItem
                        key={proj._id}
                        selected={proj.selected}
                        data-proj-id={proj._id}
                        onClick={handleProjectMenuItemClick}
                      >
                        {proj.name}
                      </ViewMenuItem>
                    ))}
                  </ul>
                </DropDownMenu>
              }
            </SelectedViewCrumb>
          </Crumb>
          /
          <SelectedViewCrumb
            edited={unsavedChanges}
            onClick={() => handleMenuCrumbClick('view')}
          >
            {selectedView ? selectedView.name : 'Loading views...'}
            {expandedMenu === 'view' &&
              <DropDownMenu>
                <ul>
                  {views.map((view) => (
                    <ViewMenuItem
                      key={view._id}
                      selected={view.selected}
                      data-view-id={view._id}
                      onClick={handleViewMenuItemClick}
                    >
                      {view.name}
                    </ViewMenuItem>
                  ))}
                </ul>
              </DropDownMenu>
            }
          </SelectedViewCrumb>
        </Breadcrumbs>
        <IconButton variant='ghost'>
          <FontAwesomeIcon icon={ 
            expandedMenu ? ['fas', 'angle-up'] : ['fas', 'angle-down']
          }/>
        </IconButton>
      </ViewNavigation>
    </StyledViewSelector>
  );
}

export default ViewSelector;

