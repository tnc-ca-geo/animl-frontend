import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectAfterMount } from '../../app/utils'
import { styled } from '../../theme/stitches.config.js';
import { selectWorkingImages } from '../review/reviewSlice';
import {
  fetchImages,
  selectHasNext,
  selectImagesLoading,
  selectPaginatedField,
  selectSortAscending,
  selectImageContextLoading,
} from './imagesSlice';
import { selectActiveFilters } from '../filters/filtersSlice';
import ImagesTable from './ImagesTable';
import { selectSelectedProject } from '../projects/projectsSlice';

// const ImagesTableLoadingOverlay = styled('div', {
//   flexGrow: '1',
//   backgroundColor: '$hiContrast',
//   opacity: '0.1',
//   display: 'flex',
//   flexDirection: 'column',
//   height: 'calc(100% - 56px)',
//   position: 'absolute',
//   width: '100%',  // TODO: how to absolute position and use flex grow
//   zIndex: '$2',
// });

const StyledImagesPanel = styled('div', {
  flexGrow: '1',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const workingImages = useSelector(selectWorkingImages);
  const hasNext = useSelector(selectHasNext);
  const imagesLoading = useSelector(selectImagesLoading);
  const imgContextLoading = useSelector(selectImageContextLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedProject && activeFilters && !imgContextLoading.isLoading) {
      dispatch(fetchImages(activeFilters));
    }
  }, [selectedProject, activeFilters, imgContextLoading, paginatedField, 
    sortAscending, dispatch]);

  const loadNextPage = () => {
    // Pass an empty promise that immediately resolves to InfiniteLoader 
    // in case it asks us to load more than once
    return imagesLoading.isLoading
      ? Promise.resolve()
      : dispatch(fetchImages(activeFilters, 'next'));
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

