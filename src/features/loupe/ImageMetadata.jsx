import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { DateTime } from 'luxon';
// import { useSelector } from 'react-redux';
// import { selectGlobalBreakpoint } from '../projects/projectsSlice.js';

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
});

const MetadataList = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
});

const MetadataPane = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  paddingRight: '$2',
  fontWeight: '$2',
});

export const ImageMetadata = ({ image }) => {
  // const globalBreakpoint = useSelector(selectGlobalBreakpoint);

  const dateCreated =
    image &&
    DateTime.fromISO(image.dateTimeOriginal).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

  const metadataItems = [
    { label: 'Date created', value: dateCreated },
    { label: 'Camera', value: image.cameraId },
    { label: 'Deployment', value: image.deploymentName },
    { label: 'File name', value: image.originalFileName },
  ];

  return (
    <MetadataPane>
      <MetadataList>
        {metadataItems.map(({ label, value }, idx) => (
          <StyledItem key={idx}>
            <ItemLabel>{label}</ItemLabel>
            <ItemValue>{value}</ItemValue>
          </StyledItem>
        ))}
      </MetadataList>
    </MetadataPane>
  );
};
