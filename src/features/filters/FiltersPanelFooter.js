import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, READ_STATS_ROLES } from '../../auth/roles';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectImagesCount,
  fetchImages,
  clearStats
} from '../images/imagesSlice';
import { selectActiveFilters  } from './filtersSlice.js';
// import { selectModalOpen, setModalOpen } from '../projects/projectsSlice';
import { Modal } from '../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import ImagesStatsModal from '../images/ImagesStatsModal';
import IconButton from '../../components/IconButton';

const RefreshButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $gray400',
  display: 'flex',
  alignItems: 'center',
  padding: '0 $1',
});

const InfoButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $gray400',
  display: 'flex',
  alignItems: 'center',
  padding: '0 $1',
});


const ImagesCount = styled('div', {
  flexGrow: 1,
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
  const userRoles = useSelector(selectUserCurrentRoles);
  const filters = useSelector(selectActiveFilters);
  const imagesCount = useSelector(selectImagesCount);
  const [ modalOpen, setModalOpen ] = useState(false);
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(fetchImages(filters));
  };

  const handleModalToggle = () => {
    dispatch(clearStats());
    setModalOpen(!modalOpen);
  };

  return (
    <StyledFiltersPanelFooter>
      <ImagesCount>
        <span>{imagesCount && imagesCount.toLocaleString('en-US')}</span> matching images 
      </ImagesCount>
      {hasRole(userRoles, READ_STATS_ROLES) &&
        <InfoButton>
          <IconButton
            variant='ghost'
            size='large'
            onClick={handleModalToggle}
          >
            <InfoCircledIcon />
          </IconButton>
        </InfoButton>
      }
      <RefreshButton>
        <IconButton
        variant='ghost'
        size='large'
        onClick={handleRefreshClick}
      >
        <FontAwesomeIcon icon={['fas', 'sync']}/>
      </IconButton>
      </RefreshButton>
      {modalOpen && 
        <Modal 
          open={modalOpen}
          handleModalToggle={handleModalToggle}
          title={'Stats'}
          size={'md'}
        >
          <ImagesStatsModal filters={filters} />
        </Modal>
      }
    </StyledFiltersPanelFooter>
  );
};

export default FiltersPanelFooter;

