import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fetchImages,
  pageInfoChanged,
  selectFilters,
  selectImages,
  selectPageInfo,
  selectLimit,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import Select from '../../components/Select';
import ImagesTable from './ImagesTable';
import { IMAGE_QUERY_LIMITS } from '../../config';

const ChangePageButton = styled.button`
  border: none;
  background: none;
  pointer-events: auto;
  svg {
    path {
      fill: ${props => props.disabled 
        ? props.theme.tokens.colors.$gray2 
        : props.theme.tokens.colors.$gray3
      };
    }
  }
  :focus {
    outline: none;
  }
  :hover {
    cursor: ${props => props.disabled ? 'auto' : 'pointer'};
    svg {
      path {
        fill: ${props => props.disabled 
          ? props.theme.tokens.colors.$gray2 
          : props.theme.tokens.colors.$gray4
        };
      }
    }
  }
`;

const LimitSelector = styled.div`
  display: flex;
  span {
    margin-right: ${props => props.theme.tokens.space.$3};
  }
`;

const ImagesListFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 20px;
  height: ${props => props.theme.tokens.space.$7};
  background-color:  ${props => props.theme.tokens.colors.$gray0};
  border-top: ${props => props.theme.border};
  border-bottom: ${props => props.theme.border};
`;

// Not a big fan of this CSS w/ hard coded heights for header and margin. Fix. 
const ImagesListPanel = styled.div`
  height: calc(100% - ${props => 
    props.theme.tokens.space.$7} - 
    ${props => props.theme.tokens.space.$7} - 2px);
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
    margin-right: ${props => props.theme.tokens.space.$3};
  }
`;

const ImagesListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  height: ${props => props.theme.tokens.space.$7};
  background-color:  ${props => props.theme.tokens.colors.$gray0};
  border-bottom: ${props => props.theme.border};
`;

const StyledImagesList = styled.div`
  width: 100%;
  background-color: ${props => props.theme.tokens.colors.$gray1};
`;

const ImagesList = () => {
  const filters = useSelector(selectFilters);
  const pageInfo = useSelector(selectPageInfo);
  const limit = useSelector(selectLimit);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('fetching images');
    dispatch(fetchImages(filters, pageInfo));
  }, [filters, limit, paginatedField, sortAscending, dispatch]);

  const handlePageChange = (page) => {
    console.log('handle page change: ', page);
    dispatch(fetchImages(filters, pageInfo, page));
  };

  const handleLimitSelectChange = (e) => {
    const newLimit = Number(e.target.value);
    dispatch(pageInfoChanged({ limit: newLimit }));
  };

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
      <ImagesListFooter>
        <Controls>
          <LimitSelector>
            <span>Rows per page:</span>
            <Select 
              handleChange={handleLimitSelectChange}
              defaultValue={limit}
              options={IMAGE_QUERY_LIMITS}
            />
          </LimitSelector>
          <ChangePageButton
            onClick={() => handlePageChange('previous')}
            disabled={pageInfo.hasPrevious ? null : true}
          >
            <FontAwesomeIcon icon={['fas', 'angle-left']} />
          </ChangePageButton>
          <ChangePageButton
            onClick={() => handlePageChange('next')}
            disabled={pageInfo.hasNext ? null : true}
          >
            <FontAwesomeIcon icon={['fas', 'angle-right']} />
          </ChangePageButton>
      </Controls>
      </ImagesListFooter>
    </StyledImagesList>
  );
};

export default ImagesList;

