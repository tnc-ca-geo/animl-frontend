import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, READ_STATS_ROLES, EXPORT_DATA_ROLES } from '../../auth/roles';
import { useDispatch, useSelector } from 'react-redux';
import { selectImagesCount, fetchImages } from '../images/imagesSlice';
import { selectActiveFilters  } from './filtersSlice.js';
import { selectModalOpen, setModalOpen, setModalContent } from '../projects/projectsSlice';
import { InfoCircledIcon, DownloadIcon, SymbolIcon } from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip';

const RefreshButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $border',
  display: 'flex',
  alignItems: 'center',
  padding: '0 $1',
});

const InfoButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $border',
  display: 'flex',
  alignItems: 'center',
  padding: '0 $1',
});

const ExportCSVButton = styled('div', {
  height: '100%',
  borderLeft: '1px solid $border',
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
  color: '$textLight',
  'span': {
    color: '$textDark',
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
  borderTop: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
});

const FiltersPanelFooter = () => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const filters = useSelector(selectActiveFilters);
  const imagesCount = useSelector(selectImagesCount);
  const modalOpen = useSelector(selectModalOpen);
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(fetchImages(filters));
  };

  const handleModalToggle = (content) => {
    dispatch(setModalOpen(!modalOpen));
    dispatch(setModalContent(content));
  };

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
            <SymbolIcon />
          </IconButton>
          </RefreshButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Refresh data
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </StyledFiltersPanelFooter>
  );
};

export default FiltersPanelFooter;

