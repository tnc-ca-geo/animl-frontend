import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectAfterMount } from '../../app/utils'
import { styled } from '../../theme/stitches.config.js';
import { selectWorkingImages } from '../review/reviewSlice';
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

const ImagesTableLoadingOverlay = styled.div({
  flexGrow: '1',
  backgroundColor: '$hiContrast',
  opacity: '0.1',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100% - 56px)',
  position: 'absolute',
  width: '100%',  // TODO: how to absolute position and use flex grow
  zIndex: '$3',
});

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
  const workingImages = useSelector(selectWorkingImages);
  const hasNext = useSelector(selectHasNext);
  const isLoading = useSelector(selectIsLoading);
  const dispatch = useDispatch();
  
  useEffectAfterMount(() => {
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
        workingImages={workingImages}
        hasNext={hasNext}
        loadNextPage={loadNextPage}
      />
    </StyledImagesPanel>
  );
};

export default ImagesPanel;

