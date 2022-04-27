import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { styled } from '../../theme/stitches.config.js';
import { DotFilledIcon } from '@radix-ui/react-icons'
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuArrow,
} from '../../components/Dropdown';


const NoneFoundAlert = styled('div', {
  fontSize: '$4',
  fontWeight: '$3',
  color: '$hiContrast',
  '&::after': {
    content: '\\1F400',
    paddingLeft: '$2',
    fontSize: '20px'
  }
});

const Crumb = styled('span', {
  color: '$hiContrast',
  fontWeight: '$3',
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

  '&[data-state="open"]': {
    color: '$blue500',
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


const ProjectAndViewNav = () => {
  const projectsLoading = useSelector(selectProjectsLoading);
  const projects = useSelector(selectProjects);
  const selectedProj = useSelector(selectSelectedProject);
  const views = useSelector(selectViews);
  const selectedView = useSelector(selectSelectedView);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
  const [expandedMenu, setExpandedMenu] = useState(false);
  const dispatch = useDispatch();

  // fetch projects
  useEffect(() => {
    const { isLoading, noneFound, errors } = projectsLoading;
    if (!projects.length && !isLoading && !noneFound && !errors) {
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

  const handleProjectMenuItemClick = (projId) => {
    if (projId === selectedProj._id) return;
    const project = projects.find((p) => p._id === projId);
    const viewId = project.views.find((v) => v.name === 'All images')._id;
    dispatch(push(`/${projId}/${viewId}`));
  };

  const handleViewMenuItemClick = (viewId) => {
    if (viewId === selectedView._id) return;
    dispatch(push(`/${selectedProj._id}/${viewId}`));
  };

  return (
    <StyledProjectAndViewNav>
      {projectsLoading.isLoading && 'Loading projects...'}
      {projectsLoading.noneFound && 
        <NoneFoundAlert>
          Rats! You don't have access to any projects yet!
        </NoneFoundAlert>
      }
      {selectedView &&
        <>
          <Breadcrumbs>
            <DropdownMenu onOpenChange={setExpandedMenu}>
              <DropdownMenuTrigger asChild>
                <Crumb>
                  {selectedProj.name}
                </Crumb>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={5}>
                <DropdownMenuLabel>Projects</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedProj._id}
                  onValueChange={handleProjectMenuItemClick}
                >
                  {projects.map((proj) => (
                    <DropdownMenuRadioItem value={proj._id} key={proj._id}>
                      <DropdownMenuItemIndicator>
                        <DotFilledIcon />
                      </DropdownMenuItemIndicator>
                      {proj.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuArrow offset={12} />
              </DropdownMenuContent>
            </DropdownMenu>
            /
            <DropdownMenu onOpenChange={setExpandedMenu}>
              <DropdownMenuTrigger asChild>
                <Crumb edited={unsavedViewChanges}>
                  {selectedView.name}
                </Crumb>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={5}>
                <DropdownMenuLabel>Views</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={selectedView._id}
                  onValueChange={handleViewMenuItemClick}
                >
                  {views.map((view) => (
                    <DropdownMenuRadioItem value={view._id} key={view._id}>
                      <DropdownMenuItemIndicator>
                        <DotFilledIcon />
                      </DropdownMenuItemIndicator>
                      {view.name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuArrow offset={12} />
              </DropdownMenuContent>
            </DropdownMenu>
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
};

function checkIfValidMD5Hash(hash) {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
}

export default ProjectAndViewNav;

