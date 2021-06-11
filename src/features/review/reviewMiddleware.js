
import { selectImages } from '../images/imagesSlice';
import {
  setFocus,
  objectAdded,
  labelAdded,
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
} from './reviewSlice';
import {
  addLabelStart,
  addLabelEnd,
  selectReviewMode,
  selectIterationOptions,
} from '../loupe/loupeSlice';

// TODO: this is similar to what's used to filter labels in FullSizeImage and
// LabelPills. Make DRY?
const isLabelInvalidated = (images, i) => {
  const label = images[i.image].objects[i.object].labels[i.label];
  if (label.validation && label.validation.validated === false) {
    return true;
  }
  return false;
};

const findNextLabel = (images, focusIndex, options) => {
  let initialImageEvaluated = false;
  let initialObjectEvaluated = false;
  
  // loop through images
  for (let i = focusIndex.image; i < images.length; i++) {
    const image = images[i];

    // don't skip empty images
    if ((!options.skipEmptyImages && image.objects.length === 0) &&
        initialImageEvaluated) {
      return { image: i, object: null, label: null };
    }

    // loop through objects
    // seed the object and label loops with current indices (if they exist),
    // but after the first loops have completed, use 0 as initial index
    const objIndex = !initialImageEvaluated && (focusIndex.object !== null)
      ? focusIndex.object
      : 0;
    for (let o = objIndex; o < image.objects.length; o++) {
      const object = image.objects[o];

      // loop through labels
      const lblIndex = !initialObjectEvaluated && (focusIndex.label !== null)
        ? focusIndex.label + 1  // check next label
        : 0;
      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = lblIndex; l < object.labels.length; l++) {
          const currIndices = { image: i, object: o, label: l };
          // TODO: we also need to see check if there's a validated label sitting
          // before this one in the labels array, and if so, skip this one
          // (it's implicitly invalid)
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
          }
        }
      }
      initialObjectEvaluated = true;
    }
    initialImageEvaluated = true;
  }
};

const findPreviousLabel = (images, focusIndex, options) => {
  let initialImageEvaluated = false;
  let initialObjectEvaluated = false;

  // loop backwards through images
  for (let i = focusIndex.image; i >= 0; i--) {
    const image = images[i];

    // don't skip empty images
    if ((!options.skipEmptyImages && image.objects.length === 0) &&
        initialImageEvaluated) {
      return { image: i, object: null, label: null };
    }

    // loop backwards through objects
    // seed the object and label loops with current indices (if they exist),
    // but after the first loops have completed, use 0 as initial index
    const objIndex = !initialImageEvaluated && (focusIndex.object !== null)
      ? focusIndex.object
      : image.objects.length - 1; // check image's last object

    for (let o = objIndex; o >= 0; o--) {
      const object = image.objects[o];

      // loop backwards through labels
      const lblIndex = !initialObjectEvaluated && (focusIndex.label !== null)
        ? focusIndex.label - 1
        : object.labels.length - 1; // check object's last label
      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = lblIndex; l >= 0; l--) {
          const currIndices = { image: i, object: o, label: l };
          // TODO: we also need to see check if there's a validated label sitting
          // before this one in the labels array, and if so, skip this one
          // (it's implicitly invalid)
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
          }
        }
      }
      initialObjectEvaluated = true;
    }
    initialImageEvaluated = true;
  }
};

export const reviewMiddleware = store => next => action => {

  if (incrementFocusIndex.match(action)) {
    next(action);
    const delta = action.payload;
    const images = selectImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    const options = selectIterationOptions(store.getState());
    const newFocusIndex = delta === 'increment'
      ? findNextLabel(images, focusIndex, options)
      : findPreviousLabel(images, focusIndex, options);
    store.dispatch(setFocus(newFocusIndex));
    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it
  }

  else if (incrementImage.match(action)) {
    next(action);
    const delta = action.payload;
    const images = selectImages(store.getState());
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