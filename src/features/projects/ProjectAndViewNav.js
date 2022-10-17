import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { styled } from '../../theme/stitches.config.js';
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
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuViewport,
  NavigationMenuIndicator,
} from '../../components/NavigationMenu';


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

const ContentList = styled('ul', {
  display: 'grid',
  padding: 22,
  margin: 0,
  columnGap: 10,
  listStyle: 'none',

  variants: {
    layout: {
      one: {
        '@media only screen and (min-width: 600px)': {
          width: 500,
          gridTemplateColumns: '.75fr 1fr',
        },
      },
      two: {
        '@media only screen and (min-width: 600px)': {
          width: 600,
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(3, 1fr)',
        },
      },
    },
  },
});

const ListItem = styled('li', {});

const LinkTitle = styled('div', {
  fontWeight: 500,
  lineHeight: 1.2,
  marginBottom: 5,
  color: '$hiContrast',

  variants: {
    selected: {
      true: {
        color: '$blue500',
      }
    }
  }
});

const LinkText = styled('p', {
  all: 'unset',
  color: '$gray600',
  lineHeight: 1.4,
  fontWeight: 'initial',
});

const ContentListItem = React.forwardRef(
  ({ children, title, selected, ...props }, forwardedRef) => (
    <ListItem>
      <NavigationMenuLink
        {...props}
        ref={forwardedRef}
        selected={selected}
        css={{
          padding: 12,
          borderRadius: '$2',
          '&:hover': { backgroundColor: '$gray200' },
        }}
      >
        <LinkTitle selected={selected}>
          {title}
        </LinkTitle>
        <LinkText>{children}</LinkText>
      </NavigationMenuLink>
    </ListItem>
  )
);

const NavigationMenuTriggerViews = styled(NavigationMenuTrigger, {
  variants: {
    edited: {
      true: {
        color: '$gray500',
      }
    }
  }
});

const MenuTitle = styled('div', {
  color: '$gray600',
  fontWeight: '$2',
  paddingLeft: '$5',
  paddingTop: '$5',
});

const ViewportPosition = styled('div', {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  top: '100%',
  left: 0,
  perspective: '2000px',
});


const ProjectAndViewNav = () => {
  const projectsLoading = useSelector(selectProjectsLoading);
  const projects = useSelector(selectProjects);
  const selectedProj = useSelector(selectSelectedProject);
  const views = useSelector(selectViews);
  const selectedView = useSelector(selectSelectedView);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
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
        console.log('img found in query');
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
    <>
      {projectsLoading.isLoading && <div>Loading projects...</div>}
      {projectsLoading.noneFound && 
        <NoneFoundAlert>
          Rats! You don't have access to any projects yet!
        </NoneFoundAlert>
      }
      {selectedView &&
        <NavigationMenu>
          <NavigationMenuList>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                onPointerMove={(e) => e.preventDefault()}
              >
                {selectedProj.name}
              </NavigationMenuTrigger>
              <NavigationMenuContent
                onPointerMove={(e) => e.preventDefault()}
              >
                <MenuTitle>Projects</MenuTitle>
                <ContentList layout="one">
                  {projects.map((proj) => (
                    <ContentListItem
                      key={proj._id}
                      title={proj.name}
                      selected={proj.selected}
                      onClick={() => handleProjectMenuItemClick(proj._id)}
                    >
                      {proj.description}
                    </ContentListItem>
                  ))}
                </ContentList>
              </NavigationMenuContent>
            </NavigationMenuItem>
    
            <NavigationMenuItem>
              <NavigationMenuTriggerViews
                onPointerMove={(e) => e.preventDefault()}
                edited={unsavedViewChanges}
              >
                {selectedView.name}
              </NavigationMenuTriggerViews>
              <NavigationMenuContent
                onPointerMove={(e) => e.preventDefault()}
              >
                <MenuTitle>Views</MenuTitle>
                <ContentList layout="two">
                  {views.map((view) => (
                    <ContentListItem
                      key={view._id}
                      title={view.name}
                      selected={view.selected}
                      onClick={() => handleViewMenuItemClick(view._id)}
                    >
                      {view.description}
                    </ContentListItem>
                  ))}
                </ContentList>
              </NavigationMenuContent>
            </NavigationMenuItem>
    
            <NavigationMenuIndicator />
          </NavigationMenuList>
    
          <ViewportPosition>
            <NavigationMenuViewport />
          </ViewportPosition>
        </NavigationMenu>
      }
    </>
  );
};


function checkIfValidMD5Hash(hash) {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
}

export default ProjectAndViewNav;

