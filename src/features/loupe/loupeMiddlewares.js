
import {
  incrementIndex,
  incrementImage,
  setIndices,
  labelValidated,
  selectReviewMode,
  selectIterationOptions,
  selectLoupeIndex,
} from './loupeSlice';
import { selectImages } from '../images/imagesSlice';
import { object } from 'yup';

const isLabelInvalidated = (images, i) => {
  const label = images[i.images].objects[i.objects].labels[i.labels];
  if (label.validation && label.validation.validated === false) {
    return true;
  }
  return false;
};

const findNextLabel = (images, index, options) => {
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use 0 as initial index
  let imageLoopExecuted = false;
  let objectLoopExecuted = false;

  for (let i = index.images; i < images.length; i++) {
    const image = images[i];

    // don't skip empty images
    if (imageLoopExecuted && 
      (!options.skipEmptyImages && image.objects.length === 0)) {
      return { images: i, objects: null, labels: null };
    }
    
    const initialObjectIndex = imageLoopExecuted ? 0 : index.objects;
    for (let o = initialObjectIndex; o < image.objects.length; o++) {
      const object = image.objects[o];
      const initialLabelIndex = objectLoopExecuted || imageLoopExecuted
         ? 0 
         : index.labels + 1;
      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = initialLabelIndex; l < object.labels.length; l++) {
          const currIndices = { images: i, objects: o, labels: l };
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

const findPreviousLabel = (images, index, options) => {
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use last item as initial index
  let imageLoopExecuted = false;
  let objectLoopExecuted = false;

  for (let i = index.images; i >= 0; i--) {
    const image = images[i];

    // don't skip empty images
    if (imageLoopExecuted && 
      (!options.skipEmptyImages && image.objects.length === 0)) {
      return { images: i, objects: null, labels: null };
    }
        
    const initialObjectIndex = imageLoopExecuted
      ? image.objects.length - 1
      : index.objects;

    for (let o = initialObjectIndex; o >= 0; o--) {
      const object = image.objects[o];
      const initialLabelIndex = objectLoopExecuted
        ? object.labels.length - 1
        : index.labels - 1;

      if (!(options.skipLockedObjects && object.locked)) {
        for (let l = initialLabelIndex; l >= 0; l--) {
          const currIndices = { images: i, objects: o, labels: l };
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
          }
        }
      }

      objectLoopExecuted = true;
    }
    imageLoopExecuted = true;
  }
}

export const incrementLoupeIndexMiddleware = store => next => action => {

  if (incrementIndex.match(action)) {

    const delta = action.payload;
    const reviewMode = selectReviewMode(store.getState());
    const images = selectImages(store.getState());
    const index = selectLoupeIndex(store.getState());

    // // If not review mode, just inc/decrement image
    // if (!reviewMode) {
    //   if (delta === 'decrement' && index.images > 0) {
    //     store.dispatch(setIndices({ images: index.images - 1 }));
    //   }
    //   else if (delta === 'increment' && index.images <= images.length) {
    //     store.dispatch(setIndices({ images: index.images + 1 }));
    //   }
    // }
    // // Else, it's in review mode, and we need to inc/decrement the label
    // else {
      const options = selectIterationOptions(store.getState())
      const newIndices = (delta === 'increment')
        ? findNextLabel(images, index, options)
        : findPreviousLabel(images, index, options);
        store.dispatch(setIndices(newIndices));
    // }

    // TODO: also stop at empty images (or have this be a setting?)

    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it

  }

  if (incrementImage.match(action)) {
    const delta = action.payload;
    const images = selectImages(store.getState());
    const index = selectLoupeIndex(store.getState());
    if (delta === 'decrement' && index.images > 0) {
      store.dispatch(setIndices({ images: index.images - 1 }));
    }
    else if (delta === 'increment' && index.images <= images.length) {
      store.dispatch(setIndices({ images: index.images + 1 }));
    }
    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it
  }

  next(action);
};