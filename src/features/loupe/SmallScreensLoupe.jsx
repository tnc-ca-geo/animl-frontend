import React from 'react';
import { styled } from '../../theme/stitches.config';
import FullSizeImage from './FullSizeImage';
import ImageReviewToolbar from './ImageReviewToolbar';
import { ImageTagsToolbar } from './ImageTagsToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { ImageMetadata } from './ImageMetadata';
import { selectUserUsername } from '../auth/authSlice';
import {
  selectLastAction,
  selectLastCategoryApplied,
  labelsValidated,
  labelsAdded,
  markedEmpty,
  objectsManuallyUnlocked,
} from '../review/reviewSlice.js';
import { selectProjectTags } from '../projects/projectsSlice.js';

const FullSizeImageWrapper = styled('div', {
  display: 'grid',
  placeItems: 'center',
  overflow: 'hidden',
});

const ToolbarContainer = styled('div', {
  height: '98x',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
});

export const SmallScreensLoupe = ({ image, idx, workingImages, shouldShowToolbar, style }) => {
  const userId = useSelector(selectUserUsername);
  const dispatch = useDispatch();
  const projectTags = useSelector(selectProjectTags);

  const validateLabels = (validated) => {
    const labelsToValidate = [];
    image.objects.forEach((object) => {
      if (object.locked) return;
      // find first non-invalidated label in array
      const label = object.labels.find(
        (lbl) => lbl.validation === null || lbl.validation.validated,
      );
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
            labelId: lastCategoryApplied,
            objId: obj._id,
            imgId: image._id,
          }));
        dispatch(labelsAdded({ labels: newLabels }));
      },
    };
    if (lastAction in actionMap) {
      actionMap[lastAction]();
    }
  };

  const handleValidateAllButtonClick = (e, validated) => {
    e.stopPropagation();
    validateLabels(validated);
  };

  const markEmpty = () => {
    const labelsToValidate = [];
    image.objects.forEach((obj) => {
      obj.labels
        .filter((lbl) => lbl.labelId === 'empty' && !lbl.validated)
        .forEach((lbl) => {
          labelsToValidate.push({
            imgId: image._id,
            objId: obj._id,
            lblId: lbl._id,
            userId,
            validated: true,
          });
        });
    });
    if (labelsToValidate.length > 0) {
      dispatch(labelsValidated({ labels: labelsToValidate }));
    } else {
      dispatch(markedEmpty({ images: [{ imgId: image._id }], userId }));
    }
  };

  const handleUnlockAllButtonClick = () => {
    const objects = image.objects
      .filter(
        (obj) =>
          obj.locked &&
          obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
      )
      .map((obj) => ({ imgId: image._id, objId: obj._id }));
    dispatch(objectsManuallyUnlocked({ objects }));
  };

  return (
    <FullSizeImageWrapper style={style}>
      <ImageMetadata image={image} />
      <FullSizeImage
        workingImages={workingImages}
        image={image}
        focusIndex={{ image: idx }}
        css={{ height: '100%', width: '100%', objectFit: 'contain' }}
      />
      {shouldShowToolbar && (
        <ToolbarContainer>
          <ImageReviewToolbar
            image={image}
            lastAction={null}
            handleRepeatAction={handleRepeatAction}
            handleValidateAllButtonClick={handleValidateAllButtonClick}
            handleMarkEmptyButtonClick={markEmpty}
            handleUnlockAllButtonClick={handleUnlockAllButtonClick}
          />
          <ImageTagsToolbar image={image} projectTags={projectTags} />
        </ToolbarContainer>
      )}
    </FullSizeImageWrapper>
  );
};
