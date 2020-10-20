import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fetchImages,
  selectFilters,
  selectImages,
} from './imagesSlice';
import ImagesTable from './ImagesTable';

// Not a big fan of this CSS w/ hard coded heights for header and margin. Fix. 
const ImagesListPanel = styled.div`
  height: calc(100% - 50px - 15px);
  overflow-y: scroll;
`;

const ViewLabel = styled.span`
  font-weight: 700;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  path {
    fill: ${props => props.theme.tokens.colors.$gray3}
  }
  pointer-events: auto;
  :hover {
    cursor: pointer;
    path {
      fill: ${props => props.theme.tokens.colors.$gray4}
    }
  }
`;

const Controls = styled.div`
  display: flex;
  svg {
    margin-right: 15px;
  }
`;

const ImagesListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  height: 50px;
  background-color:  ${props => props.theme.tokens.colors.$gray0};
  border-bottom: ${props => props.theme.border};
`;

const StyledImagesList = styled.div`
  width: 100%;
  background-color: ${props => props.theme.tokens.colors.$gray1};
`;

const ImagesList = () => {
  const filters = useSelector(selectFilters);
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('fetching images');
    dispatch(fetchImages(filters));
  }, [filters, dispatch])


  return (
    <StyledImagesList>
      <ImagesListHeader>
        <Controls>
          <StyledFontAwesomeIcon icon={['fas', 'save']} />
          <StyledFontAwesomeIcon icon={['fas', 'cog']} />
          <StyledFontAwesomeIcon icon={['fas', 'redo']} />
        </Controls>
        <ViewLabel>
          Santa Cruz Island - Biosecurity Cameras
        </ViewLabel>
        <Controls>
          <StyledFontAwesomeIcon icon={['fas', 'list-ul']} />
          <StyledFontAwesomeIcon icon={['fas', 'grip-horizontal']} />
        </Controls>
      </ImagesListHeader>
      <ImagesListPanel>
        <ImagesTable images={images} />
      </ImagesListPanel>
    </StyledImagesList>
  );
};

export default ImagesList;

