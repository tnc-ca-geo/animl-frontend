import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectWorkingImages } from '../review/reviewSlice.js';
import {
  fetchImages,
  selectHasNext,
  selectImagesLoading,
  selectPaginatedField,
  selectSortAscending,
  selectImageContextLoading,
  fetchImagesCount,
} from './imagesSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import ImagesTable from './ImagesTable.jsx';
import { selectGlobalBreakpoint } from '../projects/projectsSlice.js';
import { ImagesGrid } from './ImagesGrid.jsx';

const StyledImagesPanel = styled('div', {
  flexGrow: '1',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const activeFilters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const workingImages = useSelector(selectWorkingImages);
  const hasNext = useSelector(selectHasNext);
  const imagesLoading = useSelector(selectImagesLoading);
  const imgContextLoading = useSelector(selectImageContextLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (activeFilters && !imgContextLoading.isLoading) {
      console.log('fetching images with filters: ', activeFilters);
      dispatch(fetchImages(activeFilters));
      dispatch(fetchImagesCount(activeFilters));
    }
  }, [
    activeFilters,
    imgContextLoading,
    paginatedField,
    sortAscending,
    dispatch,
  ]);

  const loadNextPage = () => {
    // Pass an empty promise that immediately resolves to InfiniteLoader
    // in case it asks us to load more than once
    return imagesLoading.isLoading
      ? Promise.resolve()
      : dispatch(fetchImages(activeFilters, 'next'));
  };

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);

  return (
    <StyledImagesPanel>
      {currentBreakpoint !== 'xxs' && (
        <ImagesTable workingImages={workingImages} hasNext={hasNext} loadNextPage={loadNextPage} />
      )}
      {currentBreakpoint === 'xxs' && (
        <ImagesGrid workingImages={workingImages} hasNext={hasNext} loadNextPage={loadNextPage} />
      )}
    </StyledImagesPanel>
  );
};

export default ImagesPanel;
