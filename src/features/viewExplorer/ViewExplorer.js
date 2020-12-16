import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import ViewExplorerHeader from './ViewExplorerHeader';
import FiltersPanel from '../filtersPanel/FiltersPanel';
import ImagesPanel from './ImagesPanel';
import DetailsModal from '../detailsModal/DetailsModal';
import { selectDetailsOpen } from '../detailsModal/detailsModalSlice';


const ViewExplorerWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const ViewExplorerBody = styled.div({
  display: 'flex',
  flexGrow: 1,
});

export function ViewExplorer() {
  const detailsOpen = useSelector(selectDetailsOpen);

  return (
    <ViewExplorerWrapper>
      <ViewExplorerHeader />
      <ViewExplorerBody>
        <FiltersPanel />
        <ImagesPanel />
        {detailsOpen && <DetailsModal />}
      </ViewExplorerBody>
    </ViewExplorerWrapper>
  );
}
