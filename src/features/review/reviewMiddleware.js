
import _ from 'lodash';
import {
  setFocus,
  objectAdded,
  labelAdded,
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
  selectObjects,
} from './reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectReviewMode,
  selectIterationOptions,
} from '../loupe/loupeSlice';


// we could also clone the label and append the original index to it as a prop
// and return that if it helps make this function more generalizable 
// Really it should be a selector maybe? 

// active labels = labels that are validated, not invalidated, 
// or not implicitly invalidated (i.e., labels in a locked object that have 
// validated labels ahead of them in the array)
const getActiveLabelIndices = (imageIndex, objects) => {
  let filtLabels = [];
  
  for (const [i, object] of objects.entries()) {

    let labels = object.locked 
      ? [object.labels.find((label) => (
          label.validation && label.validation.validated
        ))]
      : object.labels.filter((label) => (
          label.validation === null || label.validation.validated
        ));

    labels = labels.map((label) => ({
      image: imageIndex,
      object: i,
      label: object.labels.indexOf(label)
    }));

    filtLabels = filtLabels.concat(labels);
  };

  return filtLabels;
};

const findNextLabel = (delta, images, focusIndex, options) => {
  let initialImageEvaluated = false;

  const findNextLabelOnImage = (imageIndex) => {
    const objects = images[imageIndex];

    // don't skip empty images
    if ((!options.skipEmptyImages && objects.length === 0) &&
        initialImageEvaluated) {
      return { image: imageIndex, object: null, label: null };
    }

    // filter out inactive labels for all images' objects and flatten
    const activeLabelIndices = getActiveLabelIndices(imageIndex, objects);

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

  if (incrementFocusIndex.match(action)) {
    next(action);
    const delta = action.payload;
    // TODO: make it more clear that we're actually referencing the 
    // objects proxy in the review slice here
    const images = selectObjects(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    const options = selectIterationOptions(store.getState());
    const newFocusIndex = findNextLabel(delta, images, focusIndex, options);
    store.dispatch(setFocus(newFocusIndex));
    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it
  }

  else if (incrementImage.match(action)) {
    next(action);
    const delta = action.payload;
    const images = selectObjects(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    if (delta === 'decrement' && focusIndex.image > 0) {
      store.dispatch(setFocus({ image: focusIndex.image - 1 }));
    }
    else if (delta === 'increment' && focusIndex.image <= images.length) {
      store.dispatch(setFocus({ image: focusIndex.image + 1 }));
    }
    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it
  }

  else if (objectAdded.match(action)) {
    next(action);
    store.dispatch(setFocus({ object: 0 }));
    store.dispatch(addLabelStart());// dispatch addLabelStart() ?? 
    // TODO: send request to backend to save new label to object
    // TODO: add label category to label filters list? 
  } 

  else if (labelAdded.match(action)) {
    next(action);
    store.dispatch(setFocus({ label: 0 }));
    store.dispatch(addLabelEnd());
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) {
      store.dispatch(incrementFocusIndex('increment'));
    }
    // TODO: send request to backend to save new label to object
    // TODO: add label category to label filters list? 
  } 

  else {
    next(action);
  }

};