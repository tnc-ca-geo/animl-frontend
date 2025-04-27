import React from 'react';
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
  marginLeft: '$5',
  textAlign: 'center',
  flex: '1',
  textWrap: 'nowrap',
});

const MetadataList = styled('div', {
  display: 'flex',
});

const MetadataPane = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  paddingRight: '$2',
  fontWeight: '$2',
  width: '100%',
});

const metadataBreakpoints = createBreakpoints([
  ['xs', 400],
  ['sm', 500],
  ['md', 600],
  ['lg', Infinity],
]);

const shortenedField = (fieldVal) => {
  if (fieldVal.length <= 10) {
    return fieldVal;
  }
  return `${fieldVal.substring(0, 10)}...`;
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
  const dateCreated = isSmallScreen
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
          <StyledItem key={idx}>
            <ItemLabel>{label}</ItemLabel>
            {isSmallScreen ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ItemValue>{displayValue}</ItemValue>
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
        ))}
      </MetadataList>
    </MetadataPane>
  );
};
