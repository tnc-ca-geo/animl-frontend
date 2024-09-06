import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectFocusIndex } from '../review/reviewSlice.js';
import { toggleOpenLoupe, selectLoupeOpen } from '../loupe/loupeSlice.js';
import SidebarNav from './SidebarNav.jsx';
import FiltersPanel from '../filters/FiltersPanel.jsx';
import ImagesPanel from '../images/ImagesPanel.jsx';
import Loupe from '../loupe/Loupe.jsx';
import ErrorToast from '../../components/ErrorToast.jsx';
import HydratedModal from '../../components/HydratedModal.jsx';

const ViewExplorerWrapper = styled('div', {
  display: 'flex',
  borderTop: '1px solid $border',
  backgroundColor: '$backgroundLight',
});

const ViewExplorer = () => {
  const dispatch = useDispatch();

  const loupeOpen = useSelector(selectLoupeOpen);
  const focusIndex = useSelector(selectFocusIndex);
  useEffect(() => {
    if (focusIndex.image === null) {
      dispatch(toggleOpenLoupe(false));
    }
  }, [focusIndex.image, dispatch]);

  const [filtersPanelOpen, setFiltersPanelOpen] = useState(true);
  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  };

  return (
    <ViewExplorerWrapper>
      <SidebarNav toggleFiltersPanel={toggleFiltersPanel} filtersPanelOpen={filtersPanelOpen} />
      {filtersPanelOpen && <FiltersPanel toggleFiltersPanel={toggleFiltersPanel} />}
      <ImagesPanel />
      {loupeOpen && <Loupe />}
      <HydratedModal />
      <ErrorToast />
    </ViewExplorerWrapper>
  );
};

export default ViewExplorer;
