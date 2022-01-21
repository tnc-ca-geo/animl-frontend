
import _ from 'lodash';
import { ObjectID } from 'bson';
import { selectAvailLabels, fetchLabels } from '../filters/filtersSlice';
import { editLabel } from '../images/imagesSlice';
import {
  setFocus,
  bboxUpdated,
  objectAdded,
  objectRemoved,
  objectLocked,
  objectManuallyUnlocked,
  labelAdded,
  labelRemoved,
  labelValidated,
  markedEmpty,
  markedEmptyReverted,
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
  selectWorkingImages,
  labelValidationReverted,
} from './reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectReviewMode,
  selectIterationOptions,
  selectIsAddingLabel,
} from '../loupe/loupeSlice';
// import { selectUserUsername } from '../user/userSlice';
import { findObject } from '../../app/utils';

// we could also clone the label and append the original index to it as a prop
// and return that if it helps make this function more generalizable 
// Maybe this should be a selector? 

// active labels = labels that are validated, not invalidated, 
// or not implicitly invalidated (i.e., labels in a locked object that have 
// validated labels ahead of them in the array)
const getActiveLabelIndices = (imageIndex, objects, opts) => {
  let filtLabels = [];
  
  for (const [i, object] of objects.entries()) {

    let labels = !object.locked 
      ? object.labels.filter((label) => (
          label.validation === null || label.validation.validated
        ))
      : !opts.skipLockedObjects 
        ? [object.labels.find((label) => (
            label.validation && label.validation.validated
          ))]
        : [];

    labels = labels.map((label) => ({
      image: imageIndex,
      object: i,
      label: object.labels.indexOf(label)
    }));

    filtLabels = filtLabels.concat(labels);
  };

  return filtLabels;
};

const findNextLabel = (delta, images, focusIndex, opts) => {
  let initialImageEvaluated = false;

  const findNextLabelOnImage = (imageIndex) => {
    const objects = images[imageIndex].objects;

    // don't skip empty images
    // TODO: "empty" now means has an empty label, not no labels. update this
    if ((!opts.skipEmptyImages && objects.length === 0) &&
        initialImageEvaluated) {
      return { image: imageIndex, object: null, label: null };
    }

    // filter out inactive labels for all images' objects and flatten
    const activeLabelIndices = getActiveLabelIndices(imageIndex, objects, opts);

    let nextIndex = delta === 'increment' ? 0 : activeLabelIndices.length - 1;
    // if we have an initial focusIndex.label, try the next active label
    if (focusIndex.label !== null && !initialImageEvaluated) {
      const currIndex = activeLabelIndices.findIndex((activeLabelIndex) => (
        _.isEqual(activeLabelIndex, focusIndex)
      ))
      nextIndex = delta === 'increment' ? currIndex + 1 : currIndex - 1;
    }

    // if the next index exists, return it
    return activeLabelIndices[nextIndex]
      ? activeLabelIndices[nextIndex] 
      : null;
  };

  // loop through images
  if (delta === 'increment') {
    for (let i = focusIndex.image; i < images.length; i++) {
      const nextFocusIndex = findNextLabelOnImage(i);
      if (nextFocusIndex) {
        return nextFocusIndex;
      }
      initialImageEvaluated = true;
    }
  }
  else {
    for (let i = focusIndex.image; i >= 0; i--) {
      const nextFocusIndex = findNextLabelOnImage(i);
      if (nextFocusIndex) {
        return nextFocusIndex;
      }
      initialImageEvaluated = true;
    }
  }

};

export const reviewMiddleware = store => next => action => {

  /* 
   * setFocus
   */

  if (setFocus.match(action)) {
    console.log('reviewMiddleware.setFocus(): ', action.payload);
    // prevent any focus change while user isAddingLabel
    const isAddingLabel = selectIsAddingLabel(store.getState());
    if (isAddingLabel) console.log('NOTE: preventing focus change b/c isAddingLabel === true');
    if (!isAddingLabel) next(action);
  }

  /* 
   * incrementFocusIndex
   */

  else if (incrementFocusIndex.match(action)) {
    next(action);
    const delta = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    const options = selectIterationOptions(store.getState());
    // TODO: bug here. If there isn't an next label to go to (say, b/c there 
    // are only 20 images loaded, all of them only have locked objects, and
    // the skipLockedObjects option is on), it won't return a valid newFocusIndex. 
    const newIndex = findNextLabel(delta, workingImages, focusIndex, options);
    store.dispatch(setFocus({ index: newIndex, type: 'auto' }));
  }

  /* 
   * incrementImage
   */

  else if (incrementImage.match(action)) {
    next(action);
    const delta = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    console.log(`${delta}ing with focusIndex: `, focusIndex)

    if (delta === 'decrement' && focusIndex.image > 0) {
      store.dispatch(setFocus({ 
        index: { image: focusIndex.image - 1 },
        type: 'auto' 
      }));
    }
    else if (delta === 'increment' &&
             focusIndex.image < workingImages.length - 1) {
      store.dispatch(setFocus({
        index: { image: focusIndex.image + 1 }, 
        type: 'auto' 
      }));
    }
  }

  /* 
   * bboxUpdated
   */

  else if (bboxUpdated.match(action)) {
    console.log('reviewMiddleware.bboxUpdated()');
    next(action);
    const { imgId, objId, bbox } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId: imgId,
      objectId: objId,
      diffs: { bbox },
    }));
  }
  /* 
   * labelAdded
   */

  else if (labelAdded.match(action)) {
    console.log('reviewMiddleware.labelAdded(): ', action.payload);
    const { newLabel, bbox, userId, category } = action.payload;
    const { objIsTemp, imgId, objId, newObject } = action.payload;

    const label = {
      _id: new ObjectID().toString(),
      category,
      bbox,
      validation: { validated: true, userId },  
      type: 'manual',
      conf: 1,
      userId: userId
    };
    // if we are redoing a previous labelAdded action, 
    // there will already be a newLabel in the payload 
    action.payload.newLabel = newLabel || label;

    if (objIsTemp) {
      const object = {
        _id: objId,
        bbox,
        locked: true,
        labels: [action.payload.newLabel],
      };
      action.payload.newObject = newObject || object;
    }

    next(action);

    if (objIsTemp) {
      console.log('NOTE: object isTemp, so creating object + label');
      store.dispatch(editLabel('create', 'object', {
        object: action.payload.newObject,
        imageId: imgId,
      }));
    }
    else {
      console.log('NOTE: object exists, so just creating label');
      store.dispatch(editLabel('create', 'label', {
        labels: [action.payload.newLabel],
        imageId: imgId,
        objectId: objId,
      }));
      store.dispatch(objectLocked({ imgId, objId, locked: true }));
    }

    store.dispatch(addLabelEnd());
    const newIndex = objIsTemp ? { object: 0, label: 0 } : { label: 0 };
    store.dispatch(setFocus({ index: newIndex, type: 'auto' }));
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) store.dispatch(incrementFocusIndex('increment'));

    // BUG: This seems to be firing correctly, but not returning the newly
    // created category. Might be a timing issue (new label hasn't been saved
    // before fetchLabels() returns
    const availLabels = selectAvailLabels(store.getState());
    const newCategoryAdded = !availLabels.ids.includes(
      action.payload.newLabel.category
    );
    if (newCategoryAdded) console.log('NOTE: new category detected, so fetching labels')  
    if (newCategoryAdded) store.dispatch(fetchLabels());  
    // TODO: also dispatch fetchLabels after label invalidations?
  }

  /* 
   * labelRemoved
   */

  else if (labelRemoved.match(action)) {
    console.log('reviewMiddleware.labelRemoved(): ', action.payload);
    const { imgId, objId, newLabel } = action.payload;

    // remove object if there's only one label left
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imgId, objId);
    if (object.labels.length <= 1) {
      console.log('NOTE: removing objects last label, so just deleting object')
      store.dispatch(editLabel('delete', 'object', {
        imageId: imgId,
        objectId: objId,
      }));
    }
    else {
      store.dispatch(editLabel('delete', 'label', {
        imageId: imgId,
        objectId: objId,
        labelId: newLabel._id,
      }));
      store.dispatch(objectLocked({ imgId, objId, locked: false }));
    }

    next(action);
  
    // TODO: increment focus? 
    // store.dispatch(incrementFocusIndex('increment'));
    // TODO: fetchLabels again? 
    // store.dispatch(fetchLabels());
  }

  /* 
   * labelValidated
   */

  else if (labelValidated.match(action)) {
    console.log('reviewMiddleware.labelValidated() - ', action);
    next(action);
    const { userId, imgId, objId, lblId, validated } = action.payload;

    // update label
    const validation = { validated, userId };
    store.dispatch(editLabel('update', 'label', {
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation },
    }));

    // update object
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imgId, objId);
    const allLabelsInvalidated = object.labels.every((lbl) => (
      lbl.validation && lbl.validation.validated === false
    ));
    const locked = ((!validated && allLabelsInvalidated) || validated);
    store.dispatch(objectLocked({ imgId, objId, locked}));
  }

  /* 
   * labelValidationReverted
   */

  else if (labelValidationReverted.match(action)) {
    console.log('reviewMiddleware.labelValidationReverted() - ', action);
    next(action);
    const { imgId, objId, lblId, oldValidation, oldLocked } = action.payload;

    // update label
    store.dispatch(editLabel('update', 'label', {
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation: oldValidation },
    }));

    // update object
    store.dispatch(objectLocked({ imgId, objId, locked: oldLocked }));
  }

  /* 
   * objectAdded
   */

  // NOTE: now that we are creating new objects from within labelAdded middlware, 
  // this is no longer used. However, markedEmpty is now really just adding 
  // and empty object. Consider consolidating? 
  //    - labelAdded could dispatch objectAdded internally (would need to accept labels in payload of objectAdded)
  //    - markedEmpty could do the same
  else if (objectAdded.match(action)) {
    console.log('reviewMiddleware.objectAdded(): ', action.payload);
    const { imgId, bbox, newObject } = action.payload;

    const object = {
      _id: new ObjectID().toString(),
      bbox: bbox,
      locked: false,
      labels: [],
    };
    // if we are redoing a previous objectAdded action, 
    // there will already be a newObject in the payload 
    action.payload.newObject = newObject || object;

    next(action);
    store.dispatch(setFocus({ index: { object: 0 }, type: 'auto' }));
    store.dispatch(addLabelStart());
    store.dispatch(editLabel('create', 'object', {
      object: action.payload.newObject,
      imageId: imgId,
    }));
  }

 /* 
  * objectRemoved
  */

  else if (objectRemoved.match(action)) {
    console.log('reviewMiddleware.objectRemoved(): ', action.payload);
    const { imgId, objId } = action.payload;
    store.dispatch(editLabel('delete', 'object', {
      imageId: imgId,
      objectId: objId,
    }));
    next(action);
  }

  /* 
   * objectLocked
   */

  else if (objectLocked.match(action)) {
    console.log('reviewMiddleware.objectLocked() - ', action.payload);
    next(action);
    const { imgId, objId, locked } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId: imgId,
      objectId: objId,
      diffs: { locked },
    }));
  }

  /* 
   * objectManuallyUnlocked
   */

  else if (objectManuallyUnlocked.match(action)) {
    console.log('reviewMiddleware.objectManuallyUnlocked()');
    next(action);
    const { imgId, objId } = action.payload;
    store.dispatch(objectLocked({ imgId, objId, locked: false }));
  }

  /* 
   * markedEmpty
   */

  else if (markedEmpty.match(action)) {
    console.log('reviewMiddleware.markedEmpty(): ', action.payload);
    const { imgId, userId } = action.payload;

    action.payload.newObject = action.payload.newObject || {
      _id: new ObjectID().toString(),
      bbox: [0,0,1,1],
      locked: true,
      labels: [{
        _id: new ObjectID().toString(),
        category: 'empty',
        bbox: [0,0,1,1],
        validation: { validated: true, userId },  
        type: 'manual',
        conf: 1,
        userId
      }],
    };

    next(action);
    store.dispatch(editLabel('create', 'object', {
      object: action.payload.newObject,
      imageId: imgId,
    }));
  }

  /* 
   * markedEmpty
   */

  else if (markedEmptyReverted.match(action)) {
    console.log('reviewMiddleware.markedEmptyReverted(): ', action.payload);
    const { imgId, newObject } = action.payload;
    if (newObject) {
      store.dispatch(objectRemoved({ imgId, objId: newObject._id }));
    }
  }

  else {
    next(action);
  }

};