import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as undoActions } from 'redux-undo-redo';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import {
  selectWorkingImages,
  selectFocusIndex,
  selectLastAction,
  selectLastCategoryApplied,
  labelsValidated,
  labelsAdded,
  markedEmpty,
  objectsManuallyUnlocked,
  incrementImage
} from '../review/reviewSlice.js';
import { selectModalOpen } from '../projects/projectsSlice.js';
import {
  toggleOpenLoupe,
  reviewModeToggled,
  selectReviewMode,
  selectIsAddingLabel,
  drawBboxStart,
  addLabelStart,
} from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../../auth/roles';
import PanelHeader from '../../components/PanelHeader.jsx';
import FullSizeImage from './FullSizeImage.jsx';
import ImageReviewToolbar from './ImageReviewToolbar.jsx';
import ShareImageButton from './ShareImageButton';
import LoupeDropdown from './LoupeDropdown.jsx';

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
  height: 'calc(100vh - $7 - $8 - 96px)',
  backgroundColor: '$hiContrast'
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

const ToolbarContainer = styled('div', {
  height: '96px',
});

const ShareImage = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '$2',
  bottom: '-40',
  left: '0',
  zIndex: '$3',
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

  const validateLabels = (validated) => {
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
    dispatch(labelsValidated({ labels: labelsToValidate }));
  };

  const lastAction = useSelector(selectLastAction);
  const lastCategoryApplied = useSelector(selectLastCategoryApplied);
  const handleRepeatAction = () => {
    const actionMap = {
      'labels-validated': () => validateLabels(true),
      'labels-invalidated': () => validateLabels(false),
      'marked-empty': () => markEmpty(),
      'labels-added': () => {
        const newLabels = image.objects
          .filter((obj) => !obj.locked)
          .map((obj) => ({
            objIsTemp: obj.isTemp,
            userId,
            bbox: obj.bbox,
            category: lastCategoryApplied,
            objId: obj._id,
            imgId: image._id
          }));
        dispatch(labelsAdded({ labels: newLabels }));
      }
    };
    actionMap[lastAction]();
  };

  const handleValidateAllButtonClick = (e, validated) => {
    e.stopPropagation();
    validateLabels(validated);
  };

  // track whether the image has objects with empty, unvalidated labels
  const emptyLabels = currImgObjects.reduce((acc, curr) => {
    return acc.concat(curr.labels.filter((lbl) => (
      lbl.category === 'empty' && !lbl.validated
    )));
  }, []);

  const markEmpty = () => {
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

  const handleUnlockAllButtonClick = () => {
    const objIds = currImgObjects
      .filter((obj) => (
        obj.locked && obj.labels.some((lbl) => (
          lbl.validation === null || lbl.validation.validated
        ))
      ))
      .map((obj) => obj._id);
    dispatch(objectsManuallyUnlocked({ imgId: image._id, objIds }));
  };

  const handleIncrementClick = (delta) => {
    reviewMode
      ? dispatch(incrementFocusIndex(delta))
      : dispatch(incrementImage(delta));
  };

  // format date created
  const dtCreated = image && DateTime
    .fromISO(image.dateTimeOriginal)
    .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

  // Listen for hotkeys
  // TODO: should this all live in the ImageReviewToolbar?
  // TODO: use react synthetic onKeyDown events instead?
  const reviewMode = useSelector(selectReviewMode);
  const isAddingLabel = useSelector(selectIsAddingLabel);
  const modalOpen = useSelector(selectModalOpen);
  const handleKeyDown = useCallback((e) => {
    if (!image || isAddingLabel || modalOpen) return;
    let charCode = String.fromCharCode(e.which).toLowerCase();

    // arrows or WASD (increment/decrement)
    const delta = (e.code === 'ArrowLeft' || charCode === 'a')
      ? 'decrement'
      : (e.code === 'ArrowRight' || charCode === 'd')
        ? 'increment'
        : null;

    if (delta) {
      reviewMode
        ? dispatch(incrementFocusIndex(delta))
        : dispatch(incrementImage(delta));
    }

    // ctrl-z/shift-ctrl-z (undo/redo)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && charCode === 'z') {
      dispatch(undoActions.redo());
    }
    else if ((e.ctrlKey || e.metaKey) && charCode === 'z') {
      dispatch(undoActions.undo());
    }

    // ctrl-e (edit all)
    if (((e.ctrlKey || e.metaKey) && charCode === 'e') && 
        hasRole(userRoles, WRITE_OBJECTS_ROLES)) {
      dispatch(addLabelStart('to-all-objects'));
    }

    // ctrl-v (repeat last action)
    if (((e.ctrlKey || e.metaKey) && charCode === 'v') && 
        hasRole(userRoles, WRITE_OBJECTS_ROLES)) {
      e.stopPropagation();
      handleRepeatAction();
    }


    // // handle ctrl-a (add object)
    // if (reviewMode) {
    //   let charCode = String.fromCharCode(e.which).toLowerCase();
    //   if ((e.ctrlKey || e.metaKey) && charCode === 'a') {
    //     e.stopPropagation();
    //     dispatch(drawBboxStart());
    //   }
    // }

  }, [dispatch, image, isAddingLabel, modalOpen, reviewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => { 
      window.removeEventListener('keydown', handleKeyDown) 
    }
  }, [ handleKeyDown ]);

  return (
    <StyledLoupe>
      <LoupeHeader
        handlePanelClose={handleCloseLoupe}
        closeButtonPosition='left'
      >
        {image && 
          <>
            <MetadataPane>
              <MetadataList>
                <Item label='Date created' value={dtCreated}/>
                <Item label='Camera' value={image.cameraId}/>
                <Item label='Deployment' value={image.deploymentName}/>
                <Item label='File name' value={image.originalFileName}/>
              </MetadataList>
            </MetadataPane>
            <LoupeDropdown image={image} />
          </>
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
              handleMarkEmptyButtonClick={markEmpty}
              handleAddObjectButtonClick={handleAddObjectButtonClick}
              css={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />
          </ImagePane>
        }
      </LoupeBody>
      {/*<LoupeFooter image={image}/>*/}
      <ToolbarContainer>
        {image && hasRole(userRoles, WRITE_OBJECTS_ROLES) &&
          <ImageReviewToolbar
            image={image}
            lastAction={lastAction}
            handleRepeatAction={handleRepeatAction}
            handleValidateAllButtonClick={handleValidateAllButtonClick}
            handleMarkEmptyButtonClick={markEmpty}
            handleAddObjectButtonClick={handleAddObjectButtonClick}
            handleUnlockAllButtonClick={handleUnlockAllButtonClick}
            handleIncrementClick={handleIncrementClick}
          />
        }
        <ShareImage>
          <ShareImageButton imageId={image?._id}/>
        </ShareImage>
      </ToolbarContainer>
    </StyledLoupe>
  );
};

export default Loupe;
