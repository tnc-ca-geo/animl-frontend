import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectObjects } from '../review/reviewSlice';
import {
  fetchImages,
  selectImages,
  selectHasNext,
  selectIsLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import { selectActiveFilters } from '../filters/filtersSlice';
import ImagesTable from './ImagesTable';

const StyledImagesPanel = styled.div({
  // display: 'grid',
  // gridTemplateRows: 'auto 1fr auto',
  // gridTemplateColumns: '100%',
  // width: '100%',
  flexGrow: '1',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const filters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const hasNext = useSelector(selectHasNext);
  const isLoading = useSelector(selectIsLoading);
  const images = useSelector(selectImages);
  const objects = useSelector(selectObjects);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchImages(filters));
  }, [filters, paginatedField, sortAscending, dispatch]);

  const loadNextPage = () => {
    // Pass an empty promise that immediately resolves to InfiniteLoader 
    // in case it asks us to load more than once
    return isLoading
      ? Promise.resolve()
      : dispatch(fetchImages(filters, 'next'));
  };
  
  return (
    <StyledImagesPanel>
      <ImagesTable
        images={images}
        objects={objects}
        hasNext={hasNext}
        loadNextPage={loadNextPage}
      />
    </StyledImagesPanel>
  );
};

export default ImagesPanel;

