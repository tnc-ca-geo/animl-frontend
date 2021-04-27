import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedView } from './viewsSlice';
import { selectLoupeOpen } from '../loupe/loupeSlice';
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
  const [ filtersPanelOpen, setFiltersPanelOpen ] = useState(true);
  const loupeOpen = useSelector(selectLoupeOpen);

  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  };

  return (
    <ViewExplorerWrapper>
      <SidebarNav
        view={selectedView} 
        toggleFiltersPanel={toggleFiltersPanel}
      />
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
    </ViewExplorerWrapper>
  );
};
