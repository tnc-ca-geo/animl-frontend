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
import { selectSelectedProjectId } from '../projects/projectsSlice.js';
import { ImagesGrid } from './ImagesGrid.jsx';
import { useWindowSize } from '../../hooks/useWindowSize.jsx';
import { tableBreakpoints } from './config.js';

const StyledImagesPanel = styled('div', {
  flexGrow: '1',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const selectedProjectId = useSelector(selectSelectedProjectId);
  const activeFilters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const workingImages = useSelector(selectWorkingImages);
  const hasNext = useSelector(selectHasNext);
  const imagesLoading = useSelector(selectImagesLoading);
  const imgContextLoading = useSelector(selectImageContextLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedProjectId && activeFilters && !imgContextLoading.isLoading) {
      dispatch(fetchImages(activeFilters));
      dispatch(fetchImagesCount(activeFilters));
    }
  }, [
    selectedProjectId,
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

  const { width } = useWindowSize();
  const bpSmall = tableBreakpoints.find((bp) => bp[0] === 'xs')[1];

  return (
    <StyledImagesPanel>
      {width > bpSmall && (
        <ImagesTable workingImages={workingImages} hasNext={hasNext} loadNextPage={loadNextPage} />
      )}
      {width <= bpSmall && (
        <ImagesGrid workingImages={workingImages} hasNext={hasNext} loadNextPage={loadNextPage} />
      )}
    </StyledImagesPanel>
  );
};

export default ImagesPanel;
