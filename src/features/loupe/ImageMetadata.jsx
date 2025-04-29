import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { DateTime } from 'luxon';
import { createBreakpoints } from '../../app/utils.js';
import useBreakpoints from '../../hooks/useBreakpoints.js';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';

const ItemValue = styled('div', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textDark',
});

const ItemLabel = styled('div', {
  fontSize: '$1',
  color: '$textLight',
  fontFamily: '$mono',
  marginBottom: '$1',
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
  '@bp1': {
    flex: 'unset',
  },
});

const MetadataPane = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  zIndex: '$4',
  fontWeight: '$2',
  width: '100%',
  boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
  '@bp1': {
    paddingRight: '$2',
    boxShadow: 'unset',
    zIndex: 'unset',
  },
});

const metadataBreakpoints = createBreakpoints([
  ['xs', 500],
  ['sm', 550],
  ['md', 700],
  ['lg', Infinity],
]);

const shortenedField = (fieldVal) => {
  if (fieldVal.length <= 10) {
    return fieldVal;
  }
  return `${fieldVal.substring(0, 10)}...`;
};

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

  const { ref, breakpoint } = useBreakpoints(metadataBreakpoints.values);
  const isSmallScreen = metadataBreakpoints.lessThanOrEqual(breakpoint ?? 'xs', 'md');

  const filename = isSmallScreen ? shortenedField(image.originalFileName) : image.originalFileName;

  const fullDateCreated = DateTime.fromISO(image.dateTimeOriginal).toLocaleString(
    DateTime.DATETIME_MED_WITH_SECONDS,
  );
  const dateCreated = metadataBreakpoints.lessThanOrEqual(breakpoint ?? 'xs', 'xs')
    ? DateTime.fromISO(image.dateTimeOriginal).toLocaleString(DateTime.DATE_SHORT)
    : isSmallScreen
      ? DateTime.fromISO(image.dateTimeOriginal).toLocaleString(DateTime.DATETIME_SHORT)
      : fullDateCreated;

  const cameraId = isSmallScreen ? shortenedField(image.cameraId) : image.cameraId;

  const deploymentName = isSmallScreen
    ? shortenedField(image.deploymentName)
    : image.deploymentName;

  const metadataItems = [
    { label: 'Date created', displayValue: dateCreated, fullValue: fullDateCreated },
    { label: 'Camera', displayValue: cameraId, fullValue: image.cameraId },
    { label: 'Deployment', displayValue: deploymentName, fullValue: image.deploymentName },
    { label: 'File name', displayValue: filename, fullValue: image.originalFileName },
  ];

  return (
    <MetadataPane ref={ref}>
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
