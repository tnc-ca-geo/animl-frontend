import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectAfterMount } from '../../app/utils'
import { styled } from '../../theme/stitches.config.js';
import { selectWorkingImages } from '../review/reviewSlice';
import {
  fetchImages,
  selectHasNext,
  selectIsLoading,
  selectPaginatedField,
  selectSortAscending,
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
  // display: 'grid',
  // gridTemplateRows: 'auto 1fr auto',
  // gridTemplateColumns: '100%',
  // width: '100%',
  flexGrow: '1',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  // console.groupCollapsed('ImagesPanel rendering')
  const selectedProject = useSelector(selectSelectedProject);
  const filters = useSelector(selectActiveFilters);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const workingImages = useSelector(selectWorkingImages);
  const hasNext = useSelector(selectHasNext);
  const isLoading = useSelector(selectIsLoading);
  const dispatch = useDispatch();
  // console.log('selectedProject: ', selectedProject);
  // console.log('filters: ', filters);
  // console.log('isLoading: ', isLoading);
  // console.groupEnd();

  useEffect(() => {
    if (selectedProject && filters) {
      console.log('fetching images from ImagesPanel')
      dispatch(fetchImages(filters));
    }
  }, [selectedProject, filters, paginatedField, sortAscending, dispatch]);

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

