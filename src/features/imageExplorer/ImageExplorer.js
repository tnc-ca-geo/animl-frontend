import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import FiltersPanel from './FiltersPanel';
import ImagesPanel from './ImagesPanel';
import DetailsModal from './DetailsModal';
import {
  selectDetailsOpen, 
} from './imagesSlice';


const ImageExplorerWrapper = styled.div({
  display: 'flex',
  margin: '$5',
  // marginTop: '$10',
  // stitches cannot parse token values in calc
  // height: 'calc(100vh - 48px - 72px - 24px)',
  border: '$1 solid $gray400',
});

export function ImageExplorer() {
  const detailsOpen = useSelector(selectDetailsOpen);

  return (
    <ImageExplorerWrapper>
      <FiltersPanel />
      <ImagesPanel />
      {detailsOpen && <DetailsModal />}
    </ImageExplorerWrapper>
  );
}
