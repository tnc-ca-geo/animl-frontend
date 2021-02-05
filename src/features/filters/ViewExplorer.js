import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectSelectedView,
  // fetchViews,
 } from './filtersSlice';
import SidebarNav from './SidebarNav';
import FiltersPanel from './FiltersPanel';
import ImagesPanel from '../imagesExplorer/ImagesPanel';
// import DetailsModal from '../detailsModal/DetailsModal';
import DetailsPanel from '../detailsModal/DetailsPanel';
import { selectDetailsOpen } from '../detailsModal/detailsModalSlice';


const ViewExplorerWrapper = styled.div({
  display: 'flex',
});

const ViewExplorerBody = styled.div({
  display: 'flex',
  flexGrow: 1,
});

export function ViewExplorer() {
  const selectedView = useSelector(selectSelectedView);
  const detailsOpen = useSelector(selectDetailsOpen);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   if (!views.length) {
  //     dispatch(fetchViews());
  //   }
  // }, [views, dispatch]);

  return (
    <ViewExplorerWrapper>
      <SidebarNav view={selectedView} />
      <ViewExplorerBody>
        <FiltersPanel expandedDefault={true} />
        <ImagesPanel />
        <DetailsPanel expanded={detailsOpen}/>
      </ViewExplorerBody>
    </ViewExplorerWrapper>
  );
};
