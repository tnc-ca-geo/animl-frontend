import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedView } from './viewsSlice';
import { selectFocusIndex } from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import SidebarNav from '../views/SidebarNav';
import FiltersPanel from '../filters/FiltersPanel';
import ImagesPanel from '../images/ImagesPanel';
import Loupe from '../loupe/Loupe';

const ViewExplorerWrapper = styled.div({
  display: 'flex',
});

const ViewExplorerBody = styled.div({
  display: 'flex',
  flexGrow: 1,
});

export function ViewExplorer() {
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  const loupeOpen = useSelector(selectLoupeOpen);
  const focusIndex = useSelector(selectFocusIndex);
  useEffect(() => {
    if (focusIndex.image === null) {
      dispatch(toggleOpenLoupe(false));
    }
  }, [focusIndex.image, dispatch]);

  const [ filtersPanelOpen, setFiltersPanelOpen ] = useState(true);
  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  };

  return (
    <ViewExplorerWrapper>
      <SidebarNav
        view={selectedView} 
        toggleFiltersPanel={toggleFiltersPanel}
        filtersPanelOpen={filtersPanelOpen}
      />
      {filtersPanelOpen && 
        <FiltersPanel 
          toggleFiltersPanel={toggleFiltersPanel}
        />
      }
      <ImagesPanel />
      {loupeOpen &&
        <Loupe />
      }
      {/*
      <ViewExplorerBody>
        {filtersPanelOpen && 
          <FiltersPanel 
            toggleFiltersPanel={toggleFiltersPanel}
          />
        }
        <ImagesPanel />
        {loupeOpen &&
          <Loupe />
        }
      </ViewExplorerBody>
      */}
    </ViewExplorerWrapper>
  );
};
