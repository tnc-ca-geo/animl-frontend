import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { styled } from '../../theme/stitches.config.js';
import { SimpleSpinner } from '../../components/Spinner.jsx';
import {
  selectProjectStubs,
  selectSelectedProjectId,
  selectSelectedViewId,
  selectProjectStubsLoading,
  selectProjectLoading,
  selectViews,
  selectUnsavedViewChanges,
} from './projectsSlice.js';
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
  const stubsLoading = useSelector(selectProjectStubsLoading);
  const projectLoading = useSelector(selectProjectLoading);
  const projectStubs = useSelector(selectProjectStubs);
  const selectedProjectId = useSelector(selectSelectedProjectId);
  const selectedViewId = useSelector(selectSelectedViewId);
  const views = useSelector(selectViews);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
  const dispatch = useDispatch();

  // Project & View selection is driven entirely by the URL and reconciled in
  // projectsListeners.js. This component only renders the menus and pushes new
  // URLs; it never reads or writes selection state directly.
  const selectedProjStub = projectStubs.find((p) => p._id === selectedProjectId);
  const selectedView = views?.find((v) => v._id === selectedViewId);
  const isLoading = stubsLoading.isLoading || projectLoading.isLoading;

  const handleProjectMenuItemClick = (projId) => {
    if (projId === selectedProjectId) return;
    const project = projectStubs.find((p) => p._id === projId);
    const defaultView = project.views.find((v) => v.name === 'All images') ?? project.views[0];
    if (!defaultView) return;
    dispatch(push(`/app/${projId}/${defaultView._id}`));
  };

  const handleViewMenuItemClick = (viewId) => {
    if (viewId === selectedViewId) return;
    dispatch(push(`/app/${selectedProjectId}/${viewId}`));
  };

  return (
    <NavigationMenu css={{ justifyContent: 'center', width: '100vw' }}>
      <SimpleSpinner size="sm" display={isLoading} />
      {stubsLoading.noneFound && (
        <NoneFoundAlert>Rats! You don&apos;t have access to any projects yet!</NoneFoundAlert>
      )}
      {selectedProjStub && selectedView && (
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTriggerWithCaret onPointerMove={(e) => e.preventDefault()}>
              <NavigationMenuTriggerText>{selectedProjStub.name}</NavigationMenuTriggerText>
            </NavigationMenuTriggerWithCaret>
            <NavigationMenuContent onPointerMove={(e) => e.preventDefault()}>
              <MenuTitle>Projects</MenuTitle>
              <ContentList layout="one">
                {projectStubs
                  .toSorted((a, b) => a.name.localeCompare(b.name))
                  .map((proj) => (
                    <ContentListItem
                      key={proj._id}
                      title={proj.name}
                      selected={proj._id === selectedProjectId}
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
              <NavigationMenuTriggerText>{selectedView.name}</NavigationMenuTriggerText>
            </NavigationMenuTriggerViews>
            <NavigationMenuContent onPointerMove={(e) => e.preventDefault()}>
              <MenuTitle>Views</MenuTitle>
              <ContentList layout="two">
                {views
                  .toSorted((a, b) => a.name.localeCompare(b.name))
                  .map((view) => (
                    <ContentListItem
                      key={view._id}
                      title={view.name}
                      selected={view._id === selectedViewId}
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

export default ProjectAndViewNav;
