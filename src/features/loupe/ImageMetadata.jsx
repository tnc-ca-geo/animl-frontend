import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { DateTime } from 'luxon';
import { selectGlobalBreakpoint } from '../projects/projectsSlice.js';
import { globalBreakpoints } from '../../config.js';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { useSelector } from 'react-redux';
import { shortenedField } from '../../app/utils.js';

const ItemValue = styled('div', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  fontWeight: '$4',
  color: '$textExtraLight',
  '@bp1': {
    color: '$textDark',
    fontWeight: '$3',
  },
});

const ItemLabel = styled('div', {
  fontSize: '$1',
  color: '$textLight',
  fontFamily: '$mono',
  marginTop: '$1',
  fontWeight: '$4',
  '@bp1': {
    marginBottom: '$1',
    marginTop: 'unset',
    fontWeight: '$3',
  },
});

const StyledItem = styled('div', {
  textAlign: 'center',
  flex: '1',
  textWrap: 'nowrap',
  '@bp1': {
    marginLeft: '$5',
  },
});

const MetadataList = styled('div', {
  display: 'flex',
  flex: '1',
  padding: '0 $2',
  '@bp1': {
    flex: 'unset',
    padding: 'unset',
  },
});

const MetadataPane = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  zIndex: '$4',
  fontWeight: '$2',
  width: '100%',
  backgroundColor: '$hiContrast',
  '@bp1': {
    paddingRight: '$2',
    boxShadow: 'unset',
    zIndex: 'unset',
    backgroundColor: 'unset',
  },
});

const formatDeploymentMobile = (depName, cameraId) =>
  depName === 'default' ? `${cameraId} (default)` : depName;

const ImageMetadataField = ({ isSmallScreen, label, displayValue, fullValue }) => {
  const alwaysOpen = !isSmallScreen;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <StyledItem>
      <ItemLabel>{label}</ItemLabel>
      {isSmallScreen ? (
        <Tooltip onOpenChange={setIsOpen} open={alwaysOpen || isOpen}>
          <TooltipTrigger asChild>
            <ItemValue onClick={() => setIsOpen(!isOpen)}>{displayValue}</ItemValue>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {fullValue}
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      ) : (
        <ItemValue>{displayValue}</ItemValue>
      )}
    </StyledItem>
  );
};

export const ImageMetadata = ({ image }) => {
  image = {
    ...image,
    originalFileName: image.originalFileName ?? '',
    dateTimeOriginal: image.dateTimeOriginal ?? '',
    cameraId: image.cameraId ?? '',
    deploymentName: image.deploymentName ?? '',
  };

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint ?? 'xs', 'md');

  const filename = isSmallScreen ? shortenedField(image.originalFileName) : image.originalFileName;

  const fullDateCreated = DateTime.fromISO(image.dateTimeOriginal).toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS,
  );

  const dateCreated = isSmallScreen
    ? DateTime.fromISO(image.dateTimeOriginal).toLocaleString(DateTime.DATETIME_SHORT)
    : fullDateCreated;

  const cameraId = isSmallScreen ? shortenedField(image.cameraId) : image.cameraId;

  const deploymentName = isSmallScreen
    ? formatDeploymentMobile(image.deploymentName, image.cameraId)
    : image.deploymentName;

  const metadataItems = isSmallScreen
    ? [
        { label: 'Date created', displayValue: dateCreated, fullValue: fullDateCreated },
        { label: 'Deployment', displayValue: deploymentName, fullValue: image.deploymentName },
      ]
    : [
        { label: 'Date created', displayValue: dateCreated, fullValue: fullDateCreated },
        { label: 'Camera', displayValue: cameraId, fullValue: image.cameraId },
        { label: 'Deployment', displayValue: deploymentName, fullValue: image.deploymentName },
        { label: 'File name', displayValue: filename, fullValue: image.originalFileName },
      ];

  return (
    <MetadataPane>
      <MetadataList>
        {metadataItems.map(({ label, displayValue, fullValue }, idx) => (
          <ImageMetadataField
            key={idx}
            isSmallScreen={isSmallScreen}
            label={label}
            displayValue={displayValue}
            fullValue={fullValue}
          />
        ))}
      </MetadataList>
    </MetadataPane>
  );
};
