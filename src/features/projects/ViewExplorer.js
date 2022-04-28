import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedView } from '../projects/projectsSlice';
import { selectFocusIndex } from '../review/reviewSlice';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice';
import SidebarNav from '../projects/SidebarNav';
import FiltersPanel from '../filters/FiltersPanel';
import ImagesPanel from '../images/ImagesPanel';
import Loupe from '../loupe/Loupe';
import ErrorAlerts from '../../components/ErrorAlerts';


const ViewExplorerWrapper = styled('div', {
  display: 'flex',
});


const ViewExplorer = () => {
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
        <FiltersPanel toggleFiltersPanel={toggleFiltersPanel}/>
      }
      <ImagesPanel />
      {loupeOpen && <Loupe />}
      <ErrorAlerts />
    </ViewExplorerWrapper>
  );
};


export default ViewExplorer;
