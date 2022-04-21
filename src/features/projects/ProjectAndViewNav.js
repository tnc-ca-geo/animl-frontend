import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
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
  selectUnsavedViewChanges,
  setSelectedProjAndView,
} from '../projects/projectsSlice';
import { 
  selectRouterLocation,
  fetchImageContext,
  preFocusImageStart,
} from '../images/imagesSlice';

const ViewMenuItem = styled('li', {
  color: '$hiContrast',
  padding: '$2 $3',
  fontWeight: '$2',

  '&:not(:last-child)': {
    borderBottom: '1px solid $gray400',
  },

  '&:hover': {
    color: '$blue500',
    backgroundColor: '$gray200',
  },

  variants: {
    selected: {
      true: {
        color: '$blue500',
        backgroundColor: '$blue200',
      }
    }
  },

});

const DropDownMenu = styled('div', {
  position: 'absolute',
  zIndex: '$5',
  width: '250px',
  left: '50%',
  transform: 'translateX(-50%)',
  top: '$5',
  background: '$loContrast',
  border: '1px solid $gray400',
  borderRadius: '$2',
  boxShadow: `rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, 
   rgba(22, 23, 24, 0.2) 0px 10px 20px -15px`,
  ul: {
   listStyleType: 'none',
   margin: '$0',
   paddingLeft: '$0',
  },
});

const Crumb = styled('span', {
  color: '$hiContrast',
  fontWeight: '$4',
  position: 'relative',
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
    },
    isExpanded: {
      true: {
        color: '$blue500',
      }
    }
  }
});

const Breadcrumbs = styled('div', {
  fontSize: '$4',
  fontWeight: '$2',
  color: '$gray600',
});

const StyledProjectAndViewNav = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  backgroundColor: '$loContrast',
  // zIndex: '$5',
});

const checkIfValidMD5Hash = (hash) => {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
};

const ProjectAndViewNav = () => {
  const projectsLoading = useSelector(selectProjectsLoading);
  const projects = useSelector(selectProjects);
  const selectedProj = useSelector(selectSelectedProject);
  const views = useSelector(selectViews);
  const selectedView = useSelector(selectSelectedView);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const dispatch = useDispatch();

  // fetch projects
  useEffect(() => {
    const { isLoading, noneFound } = projectsLoading;
    if (!projects.length && !isLoading && !noneFound) {
      dispatch(fetchProjects());
    }
  }, [projects, projectsLoading, dispatch]);

  // push initial selected project & view to URL
  const routerLocation = useSelector(selectRouterLocation);
  useEffect(() => {
    const paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
    const projIdInPath = paths[0];
    const viewIdInPath = paths[1];

    const projectsReady = !projectsLoading.isLoading && projects.length;
    const idsInPath = projIdInPath && viewIdInPath;

    if (projectsReady && !idsInPath && !unsavedViewChanges) {
      // TODO: check that there are projects & views in state that match the Ids
      const projId = projIdInPath || projects[0]._id;
      const proj = projects.find((p) => p._id === projId);
      const defaultView = proj.views.find((v) => v.name === 'All images');
      const viewId = viewIdInPath || defaultView._id;
      dispatch(push(`/${projId}/${viewId}`));
    }

  }, [projects, projectsLoading, unsavedViewChanges, routerLocation, dispatch]);

  // react to changes in URL & dispatch selected project and view to state
  useEffect(() => {      
    let paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
    let projId = paths[0];
    let viewId = paths[1];

    const projectsReady = !projectsLoading.isLoading && projects.length;
    const idsInPath = projId && viewId;

    if (projectsReady && idsInPath) {
      // TODO: check that there are projects & views in state that match the Ids
      dispatch(setSelectedProjAndView({ projId, viewId }));

      // if 'img' detected in query params, 
      // kick off pre-focused-image initialization sequence
      const query = routerLocation.query;
      if ('img' in query && checkIfValidMD5Hash(query.img)) {
        dispatch(preFocusImageStart(query.img));
        dispatch(fetchImageContext(query.img));
      }
    }
  }, [projects.length, projectsLoading, routerLocation, dispatch]);

  useEffect(() => {
    const handleWindowClick = (e) => { 
      if (!e.target.dataset.menu) setExpandedMenu(null);
    };
    expandedMenu 
      ? window.addEventListener('click', handleWindowClick)
      : window.removeEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, [expandedMenu, setExpandedMenu]);

  const handleBreadCrumbClick = (e) => {
    setExpandedMenu(e.target.dataset.menu);
  };

  const handleProjectMenuItemClick = (e) => {
    const projId = e.target.dataset.projId;
    if (projId !== selectedProj._id) {
      const project = projects.find((p) => p._id === projId);
      const viewId = project.views.find((v) => v.name === 'All images')._id;
      dispatch(push(`/${projId}/${viewId}`));
    }
  };

  const handleViewMenuItemClick = (e) => {
    const viewId = e.target.dataset.viewId;
    if (viewId !== selectedView._id) {
      dispatch(push(`/${selectedProj._id}/${viewId}`));
    }
  };

  return (
    <StyledProjectAndViewNav>
      {!selectedView 
        ? 'Loading projects...'
        : <>
            <Breadcrumbs>
              <Crumb 
                data-menu='project'
                onClick={handleBreadCrumbClick}
                isExpanded={expandedMenu === 'project'}
              >
                {selectedProj.name}
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
              </Crumb>
              /
              <Crumb
                data-menu='view'
                onClick={handleBreadCrumbClick}
                isExpanded={expandedMenu === 'view'}
                edited={unsavedViewChanges}
              >
                {selectedView.name}
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
              </Crumb>
            </Breadcrumbs>
            <IconButton variant='ghost'>
              <FontAwesomeIcon icon={ 
                expandedMenu ? ['fas', 'angle-up'] : ['fas', 'angle-down']
              }/>
            </IconButton>
          </>
      }
    </StyledProjectAndViewNav>
  );
}

export default ProjectAndViewNav;

