
import _ from 'lodash';
import {
  setFocus,
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
  selectWorkingImages,
} from './reviewSlice';
import {
  selectIterationOptions,
  selectIsAddingLabel,
} from '../loupe/loupeSlice';

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

export const focusMiddleware = store => next => action => {

  /* 
   * setFocus
   */

  if (setFocus.match(action)) {
    console.log('focusMiddleware.setFocus(): ', action.payload);
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
    console.log(`${delta}ing with focusIndex: `, focusIndex);
    const focusedOnFirstImg = focusIndex.image === 0;
    const focusedOnLastImg = focusIndex.image === workingImages.length - 1;

    if (delta === 'decrement' && !focusedOnFirstImg) {
      store.dispatch(setFocus({ 
        index: { image: focusIndex.image - 1 },
        type: 'auto' 
      }));
    }
    else if (delta === 'increment' && !focusedOnLastImg) {
      store.dispatch(setFocus({
        index: { image: focusIndex.image + 1 }, 
        type: 'auto' 
      }));
    }
  }

  else {
    next(action);
  }

};