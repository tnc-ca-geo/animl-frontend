import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import {
  selectWorkingImages,
  selectFocusIndex,
  labelsValidated,
  markedEmpty
} from '../review/reviewSlice.js';
import {
  toggleOpenLoupe,
  reviewModeToggled,
  selectReviewMode,
  drawBboxStart,
} from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../../auth/roles';
import PanelHeader from '../../components/PanelHeader.jsx';
import ReviewSettingsForm from './ReviewSettingsForm.jsx';
import FullSizeImage from './FullSizeImage.jsx';
import ImageReviewToolbar from './ImageReviewToolbar.jsx';
import LoupeFooter from './LoupeFooter.jsx';

import { Image } from '../../components/Image';


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
  // display: 'flex',
  // justifyContent: 'center',
  // maxWidth: '900px',
  width: '100%',
  height: '100%',
});

const LoupeBody = styled('div', {
  // flexGrow: 1,
  // display: 'grid',
  // $7 - height of panel header
  // $8 - height of nav bar 
  // 100px - height of toolbar
  height: 'calc(100vh - $7 - $8 - 100px)',
  backgroundColor: 'PapayaWhip'
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
  display: 'flex',
  flexDirection: 'column',
});

const ToolbarPlaceholder = styled('div', {
  backgroundColor: 'LightBlue',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Loupe = () => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const workingImages = useSelector(selectWorkingImages);
  const focusIndex = useSelector(selectFocusIndex);
  const currImgObjects = workingImages[focusIndex.image].objects;
  const dispatch = useDispatch();

  // track focused image
  const [ image, setImage ] = useState();
  useEffect(() => {
    setImage(workingImages[focusIndex.image]);
  }, [ workingImages, focusIndex ]);

  // // track reivew mode
  // const reviewMode = useSelector(selectReviewMode);
  // const handleToggleReviewMode = (e) => {
  //   dispatch(reviewModeToggled());
  //   e.currentTarget.blur();
  // };

  // // review mode settings modal
  // const [reviewSettingsOpen, setReviewSettingsOpen] = useState(false);
  // const handleToggleReviewSettings = () => {
  //   setReviewSettingsOpen(!reviewSettingsOpen);
  // };]

  const handleValidateAllButtonClick = (e, validated) => {
    e.stopPropagation();
    console.log('handleValidateAllButtonClick - validated: ', validated)
    const labelsToValidate = [];
    currImgObjects.forEach((object) => {
      if (object.locked) return;
      // find first non-invalidated label in array
      const label = object.labels.find((lbl) => lbl.validation === null || lbl.validation.validated);
      labelsToValidate.push({
        imgId: image._id,
        objId: object._id,
        lblId: label._id,
        userId,
        validated,
      });
    });
    console.log('handleValidateAllButtonClick - labelsToValidate: ', labelsToValidate)
    dispatch(labelsValidated({ labels: labelsToValidate }));
  };

  // track whether the image has objects with empty, unvalidated labels
  const emptyLabels = currImgObjects.reduce((acc, curr) => {
    return acc.concat(curr.labels.filter((lbl) => (
      lbl.category === 'empty' && !lbl.validated
    )));
  }, []);

  const handleMarkEmptyButtonClick = () => {
    if (emptyLabels.length > 0) {
      const labelsToValidate = [];
      currImgObjects.forEach((obj) => {
        obj.labels
          .filter((lbl) => lbl.category === 'empty' && !lbl.validated)
          .forEach((lbl) => {
            labelsToValidate.push({
              imgId: image._id,
              objId: obj._id,
              lblId: lbl._id,
              userId,
              validated: true
            });
        });
      });
      dispatch(labelsValidated({ labels: labelsToValidate }))
    }
    else {
      dispatch(markedEmpty({ images: [{ imgId: image._id }], userId }));
    }
  };
  
  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  const handleCloseLoupe = () => dispatch(toggleOpenLoupe(false));

  // format date created
  const dtCreated = image && DateTime
    .fromISO(image.dateTimeOriginal)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

  return (
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
          <ImagePane>
            {/* <Image src={image.url} css={{ height: '100%', width: '100%', objectFit: 'contain' }} /> */}
            <FullSizeImage
              workingImages={workingImages}
              image={image}
              focusIndex={focusIndex}
              handleMarkEmptyButtonClick={handleMarkEmptyButtonClick}
              handleAddObjectButtonClick={handleAddObjectButtonClick}
              css={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />
          </ImagePane>
        }
      </LoupeBody>
      {/*<LoupeFooter image={image}/>*/}
      <ToolbarPlaceholder>
        {image && hasRole(userRoles, WRITE_OBJECTS_ROLES) &&
          <ImageReviewToolbar
            image={image}
            handleValidateAllButtonClick={handleValidateAllButtonClick}
            handleMarkEmptyButtonClick={handleMarkEmptyButtonClick}
            handleAddObjectButtonClick={handleAddObjectButtonClick}
          />
        }
      </ToolbarPlaceholder>
    </StyledLoupe>
  );
};

export default Loupe;
