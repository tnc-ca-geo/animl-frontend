
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
  labelAdded,
  labelValidated,
  markedEmpty,
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
  selectWorkingImages,
} from './reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectReviewMode,
  selectIterationOptions,
} from '../loupe/loupeSlice';
import { selectUserUsername } from '../user/userSlice';

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

  // if (setFocus.match(action)) {
  //   const lastFocusIndex = selectFocusIndex(store.getState());
  //   next(action);
  //   const currFocusIndex = selectFocusIndex(store.getState());
  //   // If the user has moved away from an image, check for changes & save them
  //   if (lastFocusIndex.image !== null && 
  //     lastFocusIndex.image !== currFocusIndex.image) {
  //     const images = selectImages(store.getState());
  //     const workingImages = selectWorkingImages(store.getState());
  //     const lastImage = images[lastFocusIndex.image];
  //     const lastWorkingImage = workingImages[lastFocusIndex.image];
      
  //     // // If the last image was edited, so request updateObjects() mutation.
  //     // if (!_.isEqual(lastWorkingImage, lastImage)) {
  //     //   const payload = {
  //     //     imageId: lastWorkingImage._id,
  //     //     objects: lastWorkingImage.objects
  //     //   };
  //     //   store.dispatch(updateObjects(payload));
  //     // }
  //   }
  // }

  /* 
   * labelAdded
   */

  if (labelAdded.match(action)) {
    console.log('reviewMiddleware.labelAdded(): ', action.payload);
    const i = action.payload.index;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[i.image]
    const object = image.objects[i.object];
    const newLabel = {
      _id: new ObjectID().toString(),
      category: action.payload.category,
      bbox: object.bbox,
      validation: {
        validated: true,
        userId: action.payload.userId
      },  
      type: 'manual',
      conf: 1,
      userId: action.payload.userId
    };

    action.payload.newLabel = newLabel;
    next(action);

    store.dispatch(editLabel('create', 'label', {
      imageId: image._id,
      objectId: object._id,
      labels: [newLabel]
    }));

    store.dispatch(editLabel('update', 'object', {
      imageId: image._id,
      objectId: object._id,
      diffs: { locked: true },
    }));

    store.dispatch(setFocus({ index: { label: 0 }, type: 'auto' }));
    store.dispatch(addLabelEnd());
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) {
      store.dispatch(incrementFocusIndex('increment'));
    }

    const availLabels = selectAvailLabels(store.getState());
    if (!availLabels.ids.find((id) => id === newLabel.category)) {
      console.log('new label detected: ', newLabel.category);
      store.dispatch(fetchLabels());
      // TODO: also dispatch fetchLabels after label invalidations?
    }
  }

  /* 
   * bboxUpdated
   */

  else if (bboxUpdated.match(action)) {
    console.log('reviewMiddleware.bboxUpdated()');
    next(action);
    const { imageIndex, objectIndex, bbox } = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[imageIndex]
    const object = image.objects[objectIndex];
    store.dispatch(editLabel('update', 'object', {
      imageId: image._id,
      objectId: object._id,
      diffs: { bbox },
    }));
  }

  /* 
   * objectRemoved
   */

  else if (objectRemoved.match(action)) {
    console.log('reviewMiddleware.objectRemoved()');
    next(action);
    const { imageIndex, objectIndex } = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[imageIndex]
    const object = image.objects[objectIndex];
    store.dispatch(editLabel('delete', 'object', {
      imageId: image._id,
      objectId: object._id,
    }));
  }

  /* 
   * labelValidated
   */

  else if (labelValidated.match(action)) {
    console.log('reviewMiddleware.labelValidated()');
    next(action);
    const i = action.payload.index;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[i.image]
    const object = image.objects[i.object];
    const label = object.labels[i.label];

    // update label
    store.dispatch(editLabel('update', 'label', {
      imageId: image._id,
      objectId: object._id,
      labelId: label._id,
      diffs: { 
        validation: {
          validated: action.payload.validated,
          userId: action.payload.userId,
        }
      },
    }));

    // update object
    const allLabelsInvalidated = object.labels.every((lbl) => (
      lbl.validation && lbl.validation.validated === false
    ));
    if (action.payload.validated ||
        (!action.payload.validated && allLabelsInvalidated))  {
      store.dispatch(editLabel('update', 'object', {
        imageId: image._id,
        objectId: object._id,
        diffs: { locked: true },
      }));
    }
    else if (action.payload.validated === false && allLabelsInvalidated) {
    }
  }

  /* 
   * objectLocked
   */

  else if (objectLocked.match(action)) {
    console.log('reviewMiddleware.objectLocked()');

    next(action);
    const i = action.payload.index;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[i.image]
    const object = image.objects[i.object];
    store.dispatch(editLabel('update', 'object', {
      imageId: image._id,
      objectId: object._id,
      diffs: { locked: action.payload.locked },
    }));
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

  else if (objectAdded.match(action)) {
    console.log('reviewMiddleware.objectAdded(): ', action.payload);
    const { imageIndex, bbox } = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[imageIndex];
    const newObject = {
      _id: new ObjectID().toString(),
      bbox: bbox,
      locked: false,
      labels: [],
    };
    const createObjectPayload = {
      imageId: image._id,
      object: Object.assign({}, newObject),
    };
    action.payload.newObject = newObject;
    next(action);
    store.dispatch(setFocus({ index: { object: 0 }, type: 'auto' }));
    store.dispatch(addLabelStart());
    store.dispatch(editLabel('create', 'object', createObjectPayload));
  }

  /* 
   * objectAdded
   */

  else if (markedEmpty.match(action)) {
    console.log('reviewMiddleware.markedEmpty(): ', action.payload);
    const { imageIndex } = action.payload;
    const userId = selectUserUsername(store.getState());
    const workingImages = selectWorkingImages(store.getState());
    const image = workingImages[imageIndex];

    // Ceck if image has any objects with an unvalidated empty label. 
    let existingEmptyIndexes = [];
    image.objects.forEach((obj, i) => {
      const emptyLblIndex = obj.labels.findIndex((lbl) => (
        lbl.category === 'empty' && !lbl.validated
      ));
      if (emptyLblIndex >= 0) {
        existingEmptyIndexes.push({
          image: imageIndex,
          object: i,
          label: emptyLblIndex
        });
      }
    })

    // If so, validate it
    if (existingEmptyIndexes.length > 0) {
      existingEmptyIndexes.forEach((emptyIndex) => {
        const payload = { userId, index: emptyIndex, validated: true };
        store.dispatch(labelValidated(payload));
      });
      next(action);
    }
    // else, create new empty object
    else {
      const newObject = {
        _id: new ObjectID().toString(),
        bbox: [0,0,1,1],
        locked: true,
        labels: [{
          _id: new ObjectID().toString(),
          category: 'empty',
          bbox: [0,0,1,1],
          validation: {
            validated: true,
            userId: userId
          },  
          type: 'manual',
          conf: 1,
          userId: action.payload.userId
        }],
      };
      action.payload.newObject = newObject;

      next(action);
      store.dispatch(editLabel('create', 'object', {
        imageId: image._id,
        object: newObject,
      }));
    }
  }

  else {
    next(action);
  }

};