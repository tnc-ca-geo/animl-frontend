
import _ from 'lodash';
import {
  selectImages,
  updateObjects,
} from '../images/imagesSlice';
import {
  setFocus,
  objectAdded,
  labelAdded,
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

  if (setFocus.match(action)) {
    const lastFocusIndex = selectFocusIndex(store.getState());
    next(action);
    const currFocusIndex = selectFocusIndex(store.getState());
    // If the user has moved away from an image, check for changes & save them

    // TODO: focus index doesn't change when you close out of the loupe
    // so need to fix that if this is the diffing approach we go with

    // TODO: also should figure out how to save if a user logs out or closes
    // the browser window or refreshes... if they edited an image and didn't
    // move off of it those changes won't be saved

    if (lastFocusIndex.image !== null && 
      lastFocusIndex.image !== currFocusIndex.image) {
      const images = selectImages(store.getState());
      const workingImages = selectWorkingImages(store.getState());
      const lastImage = images[lastFocusIndex.image];
      const lastWorkingImage = workingImages[lastFocusIndex.image];
      
      // If the last image was edited, so request updateObjects() mutation.
      if (!_.isEqual(lastWorkingImage, lastImage)) {
        const payload = {
          imageId: lastWorkingImage._id,
          objects: lastWorkingImage.objects
        };
        store.dispatch(updateObjects(payload));
      }
    }
  }

  else if (incrementFocusIndex.match(action)) {
    next(action);
    const delta = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    const options = selectIterationOptions(store.getState());
    const newFocusIndex = findNextLabel(delta, workingImages, focusIndex, options);
    store.dispatch(setFocus(newFocusIndex));
  }

  else if (incrementImage.match(action)) {
    next(action);
    const delta = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    if (delta === 'decrement' && focusIndex.image > 0) {
      store.dispatch(setFocus({ image: focusIndex.image - 1 }));
    }
    else if (delta === 'increment' && focusIndex.image <= workingImages.length) {
      store.dispatch(setFocus({ image: focusIndex.image + 1 }));
    }
  }

  else if (objectAdded.match(action)) {
    next(action);
    store.dispatch(setFocus({ object: 0 }));
    store.dispatch(addLabelStart());
  } 

  else if (labelAdded.match(action)) {
    next(action);
    store.dispatch(setFocus({ label: 0 }));
    store.dispatch(addLabelEnd());
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) {
      store.dispatch(incrementFocusIndex('increment'));
    }
    // TODO: add label category to label filters list
  }

  else {
    next(action);
  }

};