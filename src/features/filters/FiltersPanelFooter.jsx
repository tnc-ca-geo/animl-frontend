import React from 'react';
import { styled, keyframes } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../auth/authSlice.js';
import {
  hasRole,
  READ_STATS_ROLES,
  DELETE_IMAGES_ROLES,
  EXPORT_DATA_ROLES,
} from '../auth/roles.js';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectImagesCount,
  selectImagesCountLoading,
  setDeleteImagesAlertOpen,
} from '../images/imagesSlice.js';
import {
  selectModalOpen,
  selectSelectedProject,
  setModalOpen,
  setModalContent,
  fetchProjects,
} from '../projects/projectsSlice.js';
import { toggleOpenLoupe } from '../loupe/loupeSlice.js';
import { InfoCircledIcon, DownloadIcon, SymbolIcon, TrashIcon } from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';

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

const DeleteImagesButton = styled('div', {
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
  span: {
    color: '$textDark',
  },
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

const ellipsis = keyframes({
  '100%': { width: '1em;' },
});

const CountingImages = styled('span', {
  minWidth: '116px',
  '&:after': {
    overflow: 'hidden',
    display: 'inline-block',
    verticalAlign: 'bottom',
    animation: `${ellipsis} steps(6,end) 1.2s infinite`,
    content: '\u2026',
    width: '0px',
  },
});

const FiltersPanelFooter = () => {
  const userRoles = useSelector(selectUserCurrentRoles);
  let imagesCount = useSelector(selectImagesCount);
  imagesCount = imagesCount && imagesCount.toLocaleString('en-US');
  const imagesCountLoading = useSelector(selectImagesCountLoading);
  const modalOpen = useSelector(selectModalOpen);
  const selectedProj = useSelector(selectSelectedProject);
  const dispatch = useDispatch();

  const handleRefreshClick = () => {
    dispatch(toggleOpenLoupe(false));
    dispatch(fetchProjects({ _ids: [selectedProj._id] }));
  };

  const handleModalToggle = (content) => {
    dispatch(setModalOpen(!modalOpen));
    dispatch(setModalContent(content));
  };

  return (
    <StyledFiltersPanelFooter>
      <ImagesCount>
        {imagesCountLoading.isLoading && <CountingImages>counting images</CountingImages>}
        {imagesCountLoading.errors && <span>error counting images</span>}
        {imagesCount !== null && (
          <div>
            <span style={{ paddingRight: '8px' }}>{imagesCount}</span>matching images
          </div>
        )}
      </ImagesCount>
      {hasRole(userRoles, READ_STATS_ROLES) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoButton>
              <IconButton
                variant="ghost"
                size="large"
                onClick={() => handleModalToggle('stats-modal')}
              >
                <InfoCircledIcon />
              </IconButton>
            </InfoButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            Get stats
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
      {hasRole(userRoles, EXPORT_DATA_ROLES) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ExportCSVButton>
              <IconButton
                variant="ghost"
                size="large"
                onClick={() => handleModalToggle('export-modal')}
              >
                <DownloadIcon />
              </IconButton>
            </ExportCSVButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            Export data
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
      {hasRole(userRoles, DELETE_IMAGES_ROLES) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <DeleteImagesButton>
              <IconButton
                variant="ghost"
                size="large"
                onClick={() => {
                  dispatch(setDeleteImagesAlertOpen(true));
                }}
              >
                <TrashIcon />
              </IconButton>
            </DeleteImagesButton>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5}>
            Delete all filtered images
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <RefreshButton>
            <IconButton variant="ghost" size="large" onClick={handleRefreshClick}>
              <SymbolIcon />
            </IconButton>
          </RefreshButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5}>
          Refresh data
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </StyledFiltersPanelFooter>
  );
};

export default FiltersPanelFooter;
