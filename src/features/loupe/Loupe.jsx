import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import {
  selectWorkingImages,
  selectFocusIndex,
} from '../review/reviewSlice.js';
import {
  toggleOpenLoupe,
  reviewModeToggled,
  selectReviewMode,
} from './loupeSlice.js';
import PanelHeader from '../../components/PanelHeader.jsx';
import ReviewSettingsForm from './ReviewSettingsForm.jsx';
import FullSizeImage from './FullSizeImage.jsx';
import LoupeFooter from './LoupeFooter.jsx';

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
  // marginBottom: '$3',
  marginLeft: '$5',
  textAlign: 'center',
});

const Item = ({label, value}) => (
  <StyledItem>
    <ItemLabel>{label}</ItemLabel>
    <ItemValue>{value}</ItemValue>
  </StyledItem>
);

const MetadataList = styled('div', {
  display: 'flex',
  flexWrap: 'wrap',
});

const MetadataPane = styled('div', {
  // paddingTop: '$3',
  // marginBottom: '$6',
  display: 'flex',
  justifyContent: 'center',
  paddingRight: '$2',
  fontWeight: '$2',
});

const ImagePane = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  // maxWidth: '900px',
});

const LoupeBody = styled('div', {
  flexGrow: 1,
  display: 'grid',
  margin: '$3',
});

const LoupeHeader = styled(PanelHeader, {
  flexDirection: 'row-reverse',
  justifyContent: 'center',
});

const StyledLoupe = styled('div', {
  boxSizing: 'border-box',
  flexGrow: '1',
  position: 'relative',
  backgroundColor: '$backgroundLight',
  borderLeft: '1px solid $border',
});

const Loupe = () => {
  const dispatch = useDispatch();

  // track focused image
  const focusIndex = useSelector(selectFocusIndex);
  const workingImages = useSelector(selectWorkingImages);
  const [ image, setImage ] = useState();
  useEffect(() => {
    setImage(workingImages[focusIndex.image]);
  }, [ workingImages, focusIndex ]);

  // track reivew mode
  const reviewMode = useSelector(selectReviewMode);
  const handleToggleReviewMode = (e) => {
    dispatch(reviewModeToggled());
    e.currentTarget.blur();
  };

  // review mode settings modal
  const [reviewSettingsOpen, setReviewSettingsOpen] = useState(false);
  const handleToggleReviewSettings = () => {
    setReviewSettingsOpen(!reviewSettingsOpen);
  };

  const handleCloseLoupe = () => dispatch(toggleOpenLoupe(false));

  // format date created
  const dtCreated = image && DateTime
    .fromISO(image.dateTimeOriginal)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

  return (
    <>
      <StyledLoupe>
        <LoupeHeader
          handlePanelClose={handleCloseLoupe}
          closeButtonPosition='left'
        >
          {image && 
            <MetadataPane>
              <MetadataList>
                <Item label='Date created' value={dtCreated}/>
                <Item label='Camera' value={image.cameraId}/>
                <Item label='Deployment' value={image.deploymentName}/>
                <Item label='File name' value={image.originalFileName}/>
              </MetadataList>
            </MetadataPane>
          }
          {/*<div>
            Label review
            <IconButton
              variant='ghost'
              onClick={handleToggleReviewMode}
            >
              <FontAwesomeIcon
                icon={ reviewMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off'] }
              />
            </IconButton>
            <IconButton
              variant='ghost'
              onClick={handleToggleReviewSettings}
            >
              <FontAwesomeIcon
                icon={['fas', 'cog']}
              />
            </IconButton>
            {reviewSettingsOpen && 
              <ReviewSettingsForm
                handleModalToggle={handleToggleReviewSettings}
              />
            }
          </div>*/}
        </LoupeHeader>
        <LoupeBody>
          {image &&
            <div>
              <ImagePane>
                <FullSizeImage
                  image={image}
                  focusIndex={focusIndex}
                />
              </ImagePane>
            </div>
          }
        </LoupeBody>
        <LoupeFooter image={image}/>
      </StyledLoupe>
    </>
  );
};

export default Loupe;
