import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fetchImages,
  selectFilters,
  selectImages,
  selectLimit,
  selectPaginatedField,
  selectSortAscending,
} from './imagesSlice';
import IconButton from '../../components/IconButton';
import ImagesTable from './ImagesTable';
import ImagesPanelFooter from './ImagesPanelFooter';

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
  const limit = useSelector(selectLimit);
  const paginatedField = useSelector(selectPaginatedField);
  const sortAscending = useSelector(selectSortAscending);
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchImages(filters));
  }, [filters, limit, paginatedField, sortAscending, dispatch]);

  return (
    <StyledImagesPanel>
      <ImagesPanelHeader>
        <ControlGroup>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'save']} />
          </IconButton>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'cog']} />
          </IconButton>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'redo']} />
          </IconButton>
        </ControlGroup>
        <ViewLabel>
          Santa Cruz Island - Biosecurity Cameras
        </ViewLabel>
        <ControlGroup>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'list-ul']} />
          </IconButton>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={['fas', 'grip-horizontal']} />
          </IconButton>
        </ControlGroup>
      </ImagesPanelHeader>
      <ImagesPanelBody>
        <ImagesTable images={images} />
      </ImagesPanelBody>
      <ImagesPanelFooter />
    </StyledImagesPanel>
  );
};

export default ImagesPanel;

