import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux';
import { selectImagesCount, fetchImages } from '../images/imagesSlice';
import { selectActiveFilters  } from './filtersSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

const RefreshButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $gray400',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  right: '0',
  padding: '0 $1',
});

const ImagesCount = styled('div', {
  width: 'calc(100% - 50px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$2',
  color: '$gray600',
  'span': {
    color: '$hiContrast',
    paddingRight: '$2',
  }
});

const StyledFiltersPanelFooter = styled('div', {
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: '$7',
  borderTop: '1px solid $gray400',
  fontWeight: '$5',
  color: '$hiContrast',
});

const FiltersPanelFooter = () => {
  const filters = useSelector(selectActiveFilters);
  const imagesCount = useSelector(selectImagesCount)
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(fetchImages(filters));
  }

  return (
    <StyledFiltersPanelFooter>
      <ImagesCount>
        <span>{imagesCount && imagesCount.toLocaleString('en-US')}</span> matching images
      </ImagesCount>
      <RefreshButton>
        <IconButton
          variant='ghost'
          size='large'
          onClick={handleRefreshClick}
        >
          <FontAwesomeIcon icon={['fas', 'sync']}/>
        </IconButton>
      </RefreshButton>
    </StyledFiltersPanelFooter>
  );
};

export default FiltersPanelFooter;

