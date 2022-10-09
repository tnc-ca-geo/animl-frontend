import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, READ_STATS_ROLES, EXPORT_DATA_ROLES } from '../../auth/roles';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectImagesCount,
  fetchImages,
  clearStats,
  clearCSVExport,
} from '../images/imagesSlice';
import { selectActiveFilters  } from './filtersSlice.js';
import { selectModalOpen, setModalOpen } from '../projects/projectsSlice';
import { Modal } from '../../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoCircledIcon, DownloadIcon } from '@radix-ui/react-icons';
import ImagesStatsModal from '../images/ImagesStatsModal';
import ExportModal from '../images/ExportModal.js';
import IconButton from '../../components/IconButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip';


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

const ExportCSVButton = styled('div', {
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
  // TODO: consider re-thinking the current modal approach (see SidebarNav).
  // The code for populating modal content is nearly the same & could 
  // potentially be consolodated into a single component.
  const [modalContent, setModalContent] = useState();
  const modalOpen = useSelector(selectModalOpen);
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(fetchImages(filters));
  };

  const handleModalToggle = (content) => {
    console.log('handleModalToggle: ', content)
    const clearData = {
      'stats-modal': () => { dispatch(clearStats()) },
      'export-modal': () => { dispatch(clearCSVExport()) },
    }
    dispatch(setModalOpen(!modalOpen));
    setModalContent(content);
    if (content) {
      clearData[content]();
    }
  };

  // TODO: add tooltips to the footer buttons

  return (
    <StyledFiltersPanelFooter>
      <ImagesCount>
        <span>{imagesCount && imagesCount.toLocaleString('en-US')}</span> matching images 
      </ImagesCount>
      {hasRole(userRoles, READ_STATS_ROLES) &&
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoButton>
              <IconButton
                variant='ghost'
                size='large'
                onClick={() => handleModalToggle('stats-modal')}
              >
                <InfoCircledIcon />
              </IconButton>
            </InfoButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} >
            Get stats
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      }
      {hasRole(userRoles, EXPORT_DATA_ROLES) &&
        <Tooltip>
          <TooltipTrigger asChild>
            <ExportCSVButton>
              <IconButton
                variant='ghost'
                size='large'
                onClick={() => handleModalToggle('export-modal')}
              >
                <DownloadIcon />
              </IconButton>
            </ExportCSVButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} >
            Export data
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      }
      <Tooltip>
        <TooltipTrigger asChild>
          <RefreshButton>
            <IconButton
            variant='ghost'
            size='large'
            onClick={handleRefreshClick}
          >
            <FontAwesomeIcon icon={['fas', 'sync']}/>
          </IconButton>
          </RefreshButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Refresh data
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
      {modalContent &&
        <Modal 
          open={modalOpen}
          handleModalToggle={() => handleModalToggle(modalContent)}
          title={modalContent && modalContentMap[modalContent].title}
          size={modalContent && modalContentMap[modalContent].size}
        >
          {modalContent && modalContentMap[modalContent].content}
        </Modal>
      }
    </StyledFiltersPanelFooter>
  );
};

const modalContentMap = {
  'stats-modal': {
    title: 'Stats',
    size: 'md',
    content: <ImagesStatsModal/>,
  },
  'export-modal': {
    title: 'Export data',
    size: 'md',
    content: <ExportModal/>,
  },
};

export default FiltersPanelFooter;

