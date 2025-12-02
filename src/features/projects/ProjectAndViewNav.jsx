import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { styled } from '../../theme/stitches.config.js';
import { SimpleSpinner } from '../../components/Spinner.jsx';
import {
  fetchProjects,
  selectProjects,
  selectSelectedProject,
  selectProjectsLoading,
  selectViews,
  selectSelectedView,
  selectUnsavedViewChanges,
  setSelectedProjAndView,
} from './projectsSlice.js';
import {
  selectRouterLocation,
  fetchImageContext,
  preFocusImageStart,
  clearImages,
} from '../images/imagesSlice.js';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTriggerWithCaret,
  NavigationMenuLink,
  NavigationMenuContent,
  NavigationMenuViewport,
  NavigationMenuIndicator,
} from '../../components/NavigationMenu.jsx';

const NoneFoundAlert = styled('div', {
  fontSize: '$4',
  fontWeight: '$3',
  color: '$textDark',
  '&::after': {
    content: '\\1F400',
    paddingLeft: '$2',
    fontSize: '20px',
  },
});

const ContentList = styled('ul', {
  display: 'grid',
  padding: 22,
  margin: 0,
  columnGap: 10,
  listStyle: 'none',
  maxHeight: '75vh',
  overflowY: 'auto',

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
  color: '$textDark',

  variants: {
    selected: {
      true: {
        color: '$blue500',
      },
    },
  },
});

const LinkText = styled('p', {
  all: 'unset',
  color: '$textMedium',
  lineHeight: 1.4,
  fontWeight: 'initial',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflowY: 'clip',
  textOverflow: 'ellipsis',
});

const ContentListItem = React.forwardRef(function ContentListItem(
  { children, title, selected, ...props },
  forwardedRef,
) {
  return (
    <ListItem>
      <NavigationMenuLink
        {...props}
        ref={forwardedRef}
        selected={selected}
        css={{
          padding: 12,
          borderRadius: '$2',
        }}
      >
        <LinkTitle selected={selected}>{title}</LinkTitle>
        <LinkText>{children}</LinkText>
      </NavigationMenuLink>
    </ListItem>
  );
});

const NavigationMenuTriggerViews = styled(NavigationMenuTriggerWithCaret, {
  variants: {
    edited: {
      true: {
        color: '$textLight',
      },
    },
  },
});

const NavigationMenuTriggerText = styled('span', {
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflowY: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '18px',
});

const MenuTitle = styled('div', {
  color: '$textMedium',
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
  const routerLocation = useSelector(selectRouterLocation);
  const paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
  const appActive = paths[0] === 'app';
  const dispatch = useDispatch();

  // fetch projects
  useEffect(() => {
    const { isLoading, noneFound, errors } = projectsLoading;
    if (!projects.length && !isLoading && !noneFound && !errors) {
      dispatch(fetchProjects());
    }
  }, [projects, projectsLoading, dispatch]);

  // push initial selected project & view to URL
  useEffect(() => {
    if (appActive) {
      const { projIdInPath, viewIdInPath } = getIdsFromPath(routerLocation);
      const projectsReady = !projectsLoading.isLoading && projects.length;
      const idsInPath = projIdInPath && viewIdInPath;

      if (projectsReady && !idsInPath && !unsavedViewChanges) {
        // TODO: check that there are projects & views in state that match the Ids
        const projId = projIdInPath || projects[0]._id;
        const proj = projects.find((p) => p._id === projId);
        const defaultView = proj.views.find((v) => v.name === 'All images');
        const viewId = viewIdInPath || defaultView._id;
        dispatch(push(`/app/${projId}/${viewId}`));
      }
    }
  }, [projects, projectsLoading, unsavedViewChanges, routerLocation, appActive, dispatch]);

  // react to changes in URL & dispatch selected project and view to state
  useEffect(() => {
    if (appActive) {
      const { projIdInPath, viewIdInPath } = getIdsFromPath(routerLocation);
      const projectsReady = !projectsLoading.isLoading && projects.length;
      const idsInPath = projIdInPath && viewIdInPath;

      if (projectsReady && idsInPath) {
        // TODO: check that there are projects & views in state that match the Ids
        dispatch(
          setSelectedProjAndView({
            projId: projIdInPath,
            viewId: viewIdInPath,
          }),
        );

        // if 'img' detected in query params,
        // kick off pre-focused-image initialization sequence
        const query = routerLocation.query;
        if ('img' in query && validateImgId(query.img)) {
          dispatch(preFocusImageStart(query.img));
          dispatch(fetchImageContext(query.img));
        }
      }
    }
  }, [projects.length, projectsLoading, routerLocation, appActive, dispatch]);

  const handleProjectMenuItemClick = (projId) => {
    if (projId === selectedProj._id) return;
    const project = projects.find((p) => p._id === projId);
    const viewId = project.views.find((v) => v.name === 'All images')._id;
    dispatch(clearImages());
    dispatch(push(`/app/${projId}/${viewId}`));
  };

  const handleViewMenuItemClick = (viewId) => {
    if (viewId === selectedView._id) return;
    dispatch(push(`/app/${selectedProj._id}/${viewId}`));
  };

  return (
    <NavigationMenu>
      <SimpleSpinner size="sm" display={projectsLoading.isLoading} />
      {projectsLoading.noneFound && (
        <NoneFoundAlert>Rats! You don&apos;t have access to any projects yet!</NoneFoundAlert>
      )}
      {selectedView && (
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTriggerWithCaret onPointerMove={(e) => e.preventDefault()}>
              <NavigationMenuTriggerText>
                {selectedProj.name}
              </NavigationMenuTriggerText>
            </NavigationMenuTriggerWithCaret>
            <NavigationMenuContent onPointerMove={(e) => e.preventDefault()}>
              <MenuTitle>Projects</MenuTitle>
              <ContentList layout="one">
                {projects.toSorted((a, b) => a.name.localeCompare(b.name)).map((proj) => (
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
              <NavigationMenuTriggerText>
                {selectedView.name}
              </NavigationMenuTriggerText>
            </NavigationMenuTriggerViews>
            <NavigationMenuContent onPointerMove={(e) => e.preventDefault()}>
              <MenuTitle>Views</MenuTitle>
              <ContentList layout="two">
                {views.toSorted((a, b) => a.name.localeCompare(b.name)).map((view) => (
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
      )}

      <ViewportPosition>
        <NavigationMenuViewport />
      </ViewportPosition>
    </NavigationMenu>
  );
};

function validateImgId(imgId) {
  const hash = imgId.includes(':') ? imgId.split(':')[1] : imgId;
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
}

function getIdsFromPath(routerLocation) {
  let paths = routerLocation.pathname.split('/').filter((p) => p.length > 0);
  return { projIdInPath: paths[1], viewIdInPath: paths[2] };
}

export default ProjectAndViewNav;
