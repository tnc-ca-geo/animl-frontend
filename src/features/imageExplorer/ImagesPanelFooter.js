import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  fetchImages,
  pageInfoChanged,
  selectFilters,
  selectLimit,
  selectHasPrevious,
  selectHasNext,
} from './imagesSlice';
import Select from '../../components/Select';
import IconButton from '../../components/IconButton';
import { IMAGE_QUERY_LIMITS } from '../../config';

const LimitSelector = styled.div({
  display: 'flex',
  alignItems: 'center',
  marginRight: '$3',
  fontSize: '$4',
  'span': {
    marginRight: '$2',
    fontWeight: '$3',
  },
});

const StyledImagesPanelFooter = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: '$0 $4',
  height: '$7',
  backgroundColor: '$loContrast',
  borderTop: '$1 solid $gray400',
});

const ControlGroup = styled.div({
  display: 'flex',
  'button': {
    marginRight: '$1',
  },
});

const ImagesPanelFooter = () => {
  const filters = useSelector(selectFilters);
  const limit = useSelector(selectLimit);
  const hasPrevious = useSelector(selectHasPrevious);
  const hasNext = useSelector(selectHasNext);
  const dispatch = useDispatch();

  const handlePageChange = (page) => {
    dispatch(fetchImages(filters, page));
  };

  const handleLimitSelectChange = (e) => {
    const newLimit = Number(e.target.value);
    dispatch(pageInfoChanged({ limit: newLimit }));
  };

  return (
    <StyledImagesPanelFooter>
      <ControlGroup>
        <LimitSelector>
          <span>Images per page:</span>
          <Select 
            handleChange={handleLimitSelectChange}
            defaultValue={limit}
            options={IMAGE_QUERY_LIMITS}
          />
        </LimitSelector>
        <IconButton variant='ghost'
          onClick={() => handlePageChange('previous')}
          disabled={hasPrevious ? null : true}
        >
          <FontAwesomeIcon icon={['fas', 'angle-left']} />
        </IconButton>
        <IconButton variant='ghost'
          onClick={() => handlePageChange('next')}
          disabled={hasNext ? null : true}
        >
          <FontAwesomeIcon icon={['fas', 'angle-right']} />
        </IconButton>
      </ControlGroup>
    </StyledImagesPanelFooter>
  );
};

export default ImagesPanelFooter;

