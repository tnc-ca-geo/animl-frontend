import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectActiveFilters } from '../filters/filtersSlice';
import {
  fetchImages,
  selectImages,
  selectHasNext,
  selectIsLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import ImagesTable from './ImagesTable';

const StyledImagesPanel = styled.div({
  // display: 'grid',
  // gridTemplateRows: 'auto 1fr auto',
  // gridTemplateColumns: '100%',
  width: '100%',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const filters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const hasNext = useSelector(selectHasNext);
  const isLoading = useSelector(selectIsLoading);
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('loading first page of images...')
    dispatch(fetchImages(filters));
  }, [filters, paginatedField, sortAscending, dispatch]);

  const loadNextPage = () => {
    console.log('loading next page...')
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
        hasNext={hasNext}
        loadNextPage={loadNextPage}
      />
    </StyledImagesPanel>
  );
};

export default ImagesPanel;

