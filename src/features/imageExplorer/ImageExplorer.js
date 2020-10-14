import React from 'react';
import styled from 'styled-components';
import FiltersPanel from './FiltersPanel';
import ImagesList from './ImagesList';

const ImageExplorerContainer = styled.div`
  display: flex;
  margin: 25px;
  margin-top: 100px;
  height: 700px;
  border: ${props => props.theme.border};
`;

export function ImageExplorer() {
  return (
    <ImageExplorerContainer>
      <FiltersPanel />
      <h3>Images List</h3>
      <ImagesList />
    </ImageExplorerContainer>
  );
}
