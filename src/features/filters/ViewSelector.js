import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { styled } from '../../theme/stitches.config.js';
import {
  selectActiveFilters,
  selectFiltersReady,
  selectUnsavedViewChanges,
} from './filtersSlice';
import {
  selectViews,
  selectSelectedView,
  fetchViews,
  setSelectedView,
 } from '../filters/filtersSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

const ViewMenuItem = styled('li', {
  padding: '$2 $3',
  fontWeight: '$2',
  ':hover': {
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

const ViewMenu = styled.div({
  position: 'absolute',
  zIndex: '$2',
  width: '250px',
  left: '$0',
  top: '$5',
  background: '$loContrast',
  border: '$1 solid $gray400',
  boxShadow: `rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, 
   rgba(22, 23, 24, 0.2) 0px 10px 20px -15px`,
  ul: {
   listStyleType: 'none',
   margin: '$0',
   paddingLeft: '$0',
  }
});

const Crumb = styled.span({
  color: '$hiContrast',
  paddingRight: '$3',
  ':last-child': {
    paddingRight: '$1',
  },
  ':not(:first-child)': {
    paddingLeft: '$3',
  },
  ':hover': {
    borderColor: '$gray700',
    cursor: 'pointer',
  },
  
  variants: {
    edited: {
      true: {
        color: '$gray500',
        '::after': {
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
});

const Breadcrumbs = styled.div({
  fontSize: '$4',
  fontWeight: '$5',
  color: '$gray600',
});

const ViewNavigation = styled.div({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
})

const StyledViewSelector = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  backgroundColor: '$loContrast',
});

const ViewSelector = () => {
  const views = useSelector(selectViews);
  const selectedView = useSelector(selectSelectedView);
  const filters = useSelector(selectActiveFilters);
  const filtersReady = useSelector(selectFiltersReady);
  const unsavedChanges = useSelector(selectUnsavedViewChanges);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!views.views.length) {
      dispatch(fetchViews());
    }
  }, [views, dispatch]);

  useEffect(() => {
    if (filtersReady && selectedView) {
      dispatch(setSelectedView(selectedView));
    }
  }, [selectedView, filtersReady, dispatch]);

  useEffect(() => {
    const handleWindowClick = () => setExpanded(false)
    if (expanded) {
      window.addEventListener('click', handleWindowClick);
    } else {
      window.removeEventListener('click', handleWindowClick)
    }
    return () => window.removeEventListener('click', handleWindowClick);
  }, [expanded, setExpanded]);

  const handleViewNavClick = () => {
    setExpanded(!expanded);
  };

  const handleViewMenuItemClick = (e) => {
    const _id = e.target.dataset.viewId;
    const newSelectedView = views.views.filter((view) => view._id === _id)[0];
    dispatch(setSelectedView(newSelectedView));
  }

  return (
    <StyledViewSelector>
      <ViewNavigation onClick={handleViewNavClick}>
        <Breadcrumbs>
          <Crumb>
            Santa Cruz Island
          </Crumb>
          /
          <SelectedViewCrumb edited={unsavedChanges}>
            {selectedView ? selectedView.name : 'Loading view...'}
            {expanded &&
              <ViewMenu>
                <ul>
                  {views.views.map((view) => (
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
              </ViewMenu>
            }
          </SelectedViewCrumb>
        </Breadcrumbs>
        <IconButton variant='ghost'>
          <FontAwesomeIcon icon={ 
            expanded ? ['fas', 'angle-up'] : ['fas', 'angle-down']
          }/>
        </IconButton>
      </ViewNavigation>
    </StyledViewSelector>
  );
}

export default ViewSelector;

