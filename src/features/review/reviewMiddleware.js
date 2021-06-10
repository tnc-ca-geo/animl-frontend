
import {
  setFocus,
  objectAdded,
  labelAdded,
  incrementFocusIndex,
  incrementImage,
  clearImages,
  getImagesSuccess,
  selectImages,
  selectFocusIndex,
} from './imagesSlice';
import {
  selectReviewMode,
  selectIterationOptions,
} from '../loupe/loupeSlice';
import {
  clearObjects,
  syncObjects,
} from '../review/reviewSlice';

const isLabelInvalidated = (images, i) => {
  const label = images[i.image].objects[i.object].labels[i.label];
  if (label.validation && label.validation.validated === false) {
    return true;
  }
  return false;
};

const findNextLabel = (images, focusIndex, options) => {
  console.log('finding next label')
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use 0 as initial index
  let imageLoopExecuted = false;
  let objectLoopExecuted = false;

  for (let i = focusIndex.image; i < images.length; i++) {
    const image = images[i];

    // don't skip empty images
    if (imageLoopExecuted && 
      (!options.skipEmptyImages && image.objects.length === 0)) {
      console.log('incrementing to an empty image...')
      return { image: i, object: null, label: null };
    }
    
    const initialObjectIndex = imageLoopExecuted ? 0 : focusIndex.object;
    for (let o = initialObjectIndex; o < image.objects.length; o++) {
      console.log('o: ', o);
      console.log('object: ', image.objects[o]);
      const object = image.objects[o];
      const initialLabelIndex = objectLoopExecuted || imageLoopExecuted
        ? 0 
        : focusIndex.label + 1;

      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = initialLabelIndex; l < object.labels.length; l++) {
          const currIndices = { image: i, object: o, label: l };
          if (!isLabelInvalidated(images, currIndices)) {
            console.log('found it! returning: ', currIndices)
            return currIndices;
          }
        }
      }
      objectLoopExecuted = true;
    }
    imageLoopExecuted = true;
  }
};

const findPreviousLabel = (images, focusIndex, options) => {
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use last item as initial index
  let imageLoopExecuted = false;
  let objectLoopExecuted = false;

  for (let i = focusIndex.images; i >= 0; i--) {
    const image = images[i];

    // don't skip empty images
    if (imageLoopExecuted && 
      (!options.skipEmptyImages && image.objects.length === 0)) {
      return { image: i, object: null, label: null };
    }
        
    const initialObjectIndex = imageLoopExecuted
      ? image.objects.length - 1
      : focusIndex.object;

    for (let o = initialObjectIndex; o >= 0; o--) {
      const object = image.objects[o];
      const initialLabelIndex = objectLoopExecuted
        ? object.labels.length - 1
        : focusIndex.label - 1;

      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = initialLabelIndex; l >= 0; l--) {
          const currIndices = { image: i, object: o, label: l };
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
          }
        }
      }
      objectLoopExecuted = true;
    }
    imageLoopExecuted = true;
  }
};

export const reviewMiddleware = store => next => action => {

  if (incrementFocusIndex.match(action)) {
    next(action);
    console.log('incrementing focus index');
    const delta = action.payload;
    const reviewMode = selectReviewMode(store.getState());
    const images = selectImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    console.log('current focus index: ', focusIndex);
    // // If not review mode, just inc/decrement image
    // if (!reviewMode) {
    //   if (delta === 'decrement' && index.images > 0) {
    //     store.dispatch(setFocus({ image: index.images - 1 }));
    //   }
    //   else if (delta === 'increment' && index.images <= images.length) {
    //     store.dispatch(setFocus({ image: index.images + 1 }));
    //   }
    // }
    // // Else, it's in review mode, and we need to inc/decrement the label
    // else {
      const options = selectIterationOptions(store.getState());
      const newFocusIndex = (delta === 'increment')
        ? findNextLabel(images, focusIndex, options)
        : findPreviousLabel(images, focusIndex, options);

      console.log('new focus index: ', newFocusIndex);
      store.dispatch(setFocus(newFocusIndex));
    // }

    // TODO: also stop at empty images (or have this be a setting?)

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
    // TODO: send request to backend to save new label to object
    // TODO: add label category to label filters list? 
  } 

  else if (labelAdded.match(action)) {
    next(action);
    store.dispatch(setFocus({ label: 0 }));
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