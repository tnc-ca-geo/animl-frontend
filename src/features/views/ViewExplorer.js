import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedView } from './viewsSlice';
import { selectDetailsOpen } from '../detailsModal/detailsModalSlice';
import SidebarNav from '../filters/SidebarNav';
import FiltersPanel from '../filters/FiltersPanel';
import ImagesPanel from '../imagesExplorer/ImagesPanel';
import DetailsPanel from '../detailsModal/DetailsPanel';

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
