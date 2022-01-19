
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
    if (!isAddingLabel) {
      next(action);
    }
  }

  /* 
   * labelAdded
   */

  else if (labelAdded.match(action)) {
    console.log('reviewMiddleware.labelAdded(): ', action.payload);
    const {  objIsBeingAdded, imageId, objectId, bbox, userId, category, newObject, newLabel } = action.payload;

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
    // action.payload.newLabel = newLabel || label;     // <- i think that would work
    action.payload.newLabel = newLabel ? newLabel : label;

    if (objIsBeingAdded) {
      const object = {
        _id: objectId,
        bbox: action.payload.bbox,
        locked: true,
        labels: [action.payload.newLabel],
      };
      action.payload.newObject = newObject ? newObject : object;
    }

    next(action);

    if (objIsBeingAdded) {
      store.dispatch(editLabel('create', 'object', {
        object: action.payload.newObject,
        imageId,
      }));
    }
    else {
      store.dispatch(editLabel('create', 'label', {
        labels: [action.payload.newLabel],
        imageId,
        objectId,
      }));
      store.dispatch(objectLocked({ imageId, objectId, locked: true }));
    }

    store.dispatch(addLabelEnd());
    store.dispatch(setFocus({ index: { label: 0 }, type: 'auto' }));
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) store.dispatch(incrementFocusIndex('increment'));

    const availLabels = selectAvailLabels(store.getState());
    if (!availLabels.ids.find((id) => id === action.payload.newLabel.category)) {
      store.dispatch(fetchLabels());
      // TODO: also dispatch fetchLabels after label invalidations?
    }
  }

  /* 
   * labelRemoved
   */

  else if (labelRemoved.match(action)) {
    console.log('reviewMiddleware.labelRemoved(): ', action.payload);
    const { imageId, objectId, newLabel } = action.payload;

    // remove object if there's only one label left
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imageId, objectId);
    if (object.labels.length <= 1) {
      store.dispatch(editLabel('delete', 'object', { imageId, objectId }));
    }
    else {
      store.dispatch(editLabel('delete', 'label', {
        imageId,
        objectId,
        labelId: newLabel._id,
      }));
      store.dispatch(objectLocked({ imageId, objectId, locked: false }));
    }

    next(action);
  
    // TODO: increment focus? 
    // store.dispatch(incrementFocusIndex('increment'));
    // TODO: fetchLabels again? 
    // store.dispatch(fetchLabels());
  }

  /* 
   * bboxUpdated
   */

  else if (bboxUpdated.match(action)) {
    console.log('reviewMiddleware.bboxUpdated()');
    next(action);
    const { imageId, objectId, bbox } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId,
      objectId,
      diffs: { bbox },
    }));
  }

  /* 
   * objectRemoved
   */

  else if (objectRemoved.match(action)) {
    console.log('reviewMiddleware.objectRemoved(): ', action.payload);
    const { imageId, objectId } = action.payload;
    store.dispatch(editLabel('delete', 'object', { imageId, objectId }));
    next(action);
  }

  /* 
   * labelValidated
   */

  else if (labelValidated.match(action)) {
    console.log('reviewMiddleware.labelValidated() - ', action);
    next(action);
    const {
      userId,
      imageId,
      objectId,
      labelId,
      validated,
    } = action.payload;

    // update label
    const validation = { validated, userId };
    store.dispatch(editLabel('update', 'label', {
      imageId,
      objectId,
      labelId,
      diffs: { validation },
    }));

    // update object
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imageId, objectId);
    const allLabelsInvalidated = object.labels.every((lbl) => (
      lbl.validation && lbl.validation.validated === false
    ));
    const locked = ((!validated && allLabelsInvalidated) || validated);
    store.dispatch(objectLocked({ imageId, objectId, locked}));
    // store.dispatch(editLabel('update', 'object', {
    //   imageId: image._id,
    //   objectId: object._id,
    //   diffs: { locked },
    // }));
  }

  /* 
   * labelValidationReverted
   */

  else if (labelValidationReverted.match(action)) {
    console.log('reviewMiddleware.labelValidationReverted() - ', action);
    next(action);
    const { imageId, objectId, labelId, oldValidation, oldLocked } = action.payload;

    // update label
    store.dispatch(editLabel('update', 'label', {
      imageId,
      objectId,
      labelId,
      diffs: { validation: oldValidation },
    }));

    // update object
    store.dispatch(objectLocked({ imageId, objectId, locked: oldLocked }));
  }

  /* 
   * objectLocked
   */

  else if (objectLocked.match(action)) {
    console.log('reviewMiddleware.objectLocked() - ', action.payload);
    next(action);
    const { imageId, objectId, locked } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId,
      objectId,
      diffs: { locked },
    }));
  }

  /* 
   * objectManuallyUnlocked
   */

  else if (objectManuallyUnlocked.match(action)) {
    console.log('reviewMiddleware.objectManuallyUnlocked()');
    next(action);
    const { imageId, objectId } = action.payload;
    store.dispatch(objectLocked({ imageId, objectId, locked: false }));
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
    const newFocusIndex = findNextLabel(delta, workingImages, focusIndex, options);
    store.dispatch(setFocus({ index: newFocusIndex, type: 'auto' }));
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
    console.log(`and workingImages.length: ${workingImages.length}`)

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
   * objectAdded
   */

  // NOTE: now that we are creating new objects from within labelAdded middlware, 
  // this is no longer used. However, markedEmpty is now really just adding 
  // and empty object. Consider consolidating? 
  else if (objectAdded.match(action)) {
    console.log('reviewMiddleware.objectAdded(): ', action.payload);
    const { imageId, bbox } = action.payload;
    // TODO: double check this is working as intended
    // if we are redoing a previous objectAdded action, 
    // there will already be a newObject in the payload 
    const newObject =  action.payload.newObject 
      ?  action.payload.newObject
      : {
          _id: new ObjectID().toString(),
          bbox: bbox,
          locked: false,
          labels: [],
        };
    const createObjectPayload = {
      object: Object.assign({}, newObject),
      imageId,
    };
    action.payload.newObject = newObject;
    next(action);
    store.dispatch(setFocus({ index: { object: 0 }, type: 'auto' }));
    store.dispatch(addLabelStart());
    store.dispatch(editLabel('create', 'object', createObjectPayload));
  }

  /* 
   * markedEmpty
   */

  else if (markedEmpty.match(action)) {
    console.log('reviewMiddleware.markedEmpty(): ', action.payload);
    const { imageId, userId } = action.payload;

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
      imageId,
    }));
  }

  /* 
   * markedEmpty
   */

  else if (markedEmptyReverted.match(action)) {
    console.log('reviewMiddleware.markedEmptyReverted(): ', action.payload);
    const { imageId, newObject } = action.payload;
    if (newObject) {
      store.dispatch(objectRemoved({ imageId, objectId: newObject._id }));
    }
  }

  else {
    next(action);
  }

};