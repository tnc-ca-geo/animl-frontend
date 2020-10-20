import React from 'react';
import styled from 'styled-components';
import FiltersPanel from './FiltersPanel';
import ImagesList from './ImagesList';

const ImageExplorerContainer = styled.div`
  display: flex;
  margin: 25px;
  margin-top: 80px;
  height: calc(100vh - 55px - 100px);
  border: ${props => props.theme.border};
`;

export function ImageExplorer() {
  return (
    <ImageExplorerContainer>
      <FiltersPanel />
      <ImagesList />
    </ImageExplorerContainer>
  );
}
