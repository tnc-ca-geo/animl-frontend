import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { selectFilters } from '../filtersPanel/filtersSlice';
import {
  fetchImages,
  selectImages,
  selectHasNext,
  selectIsLoading,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import IconButton from '../../components/IconButton';
import ImagesTable from './ImagesTable';

const ImagesPanelBody = styled.div({
  flexGrow: '1',
  backgroundColor: '$gray200',
});

const ViewLabel = styled.span({
  fontWeight: '$5', 
});

const ControlGroup = styled.div({
  display: 'flex',
  'button': {
    marginRight: '$1',
  },
});

const ImagesPanelHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  height: '$7',
  backgroundColor: '$loContrast',
  borderBottom: '$1 solid $gray400',
});

const StyledImagesPanel = styled.div({
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateColumns: '100%',
  width: '100%',
  backgroundColor: '$loContrast',
});

const ImagesPanel = () => {
  const filters = useSelector(selectFilters);
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
      <ImagesPanelHeader>
        <ControlGroup>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'save']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'cog']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'redo']} />
          </IconButton>
        </ControlGroup>
        <ViewLabel>
          Santa Cruz Island - Biosecurity Cameras
        </ViewLabel>
        <ControlGroup>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'list-ul']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'grip-horizontal']} />
          </IconButton>
        </ControlGroup>
      </ImagesPanelHeader>
      <ImagesPanelBody>
        <ImagesTable
          images={images}
          hasNext={hasNext}
          loadNextPage={loadNextPage}
        />
      </ImagesPanelBody>
    </StyledImagesPanel>
  );
};

export default ImagesPanel;

