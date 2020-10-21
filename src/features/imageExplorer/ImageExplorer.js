import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import FiltersPanel from './FiltersPanel';
import ImagesList from './ImagesList';

const ImageExplorerWrapper = styled.div({
  display: 'flex',
  margin: '$4',
  marginTop: '$10',
  // stitches cannot parse token values in calc
  height: 'calc(100vh - 48px - 72px - 24px)',
  border: '$1 solid $gray400',
});

export function ImageExplorer() {
  return (
    <ImageExplorerWrapper>
      <FiltersPanel />
      <ImagesList />
    </ImageExplorerWrapper>
  );
}
