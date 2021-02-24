
import {
  incrementIndex,
  setIndices,
  labelValidated,
  selectReviewMode,
  selectIndex
} from './loupeSlice';
import { selectImages } from '../images/imagesSlice';
import { object } from 'yup';

const isLabelInvalidated = (images, i) => {
  const label = images[i.images].objects[i.objects].labels[i.labels];
  console.log('checking label: ', label)
  if (label.validation && label.validation.validated === false) {
    return true;
  }
  return false;
};

const findNextLabel = (images, index) => {
  console.log('index on findNextLabel(): ', index);
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use 0 as initial index
  let imageLoopExecuted = false,
    objectLoopExecuted = false;

  label_loop: 
  for (let i = index.images; i < images.length; i++) {
    const image = images[i];
    const initialObjectIndex = imageLoopExecuted ? 0 : index.objects;
    for (let o = initialObjectIndex; o < image.objects.length; o++) {
      const object = image.objects[o];
      // TODO: bug here. If you start on an image with no labels, 
      // switch on review mode, iterate to next label
      // you start on labels[1] b/c the objectLoop has not yet executed
      // might be fixed by including empty images in label iteration?
      const initialLabelIndex = objectLoopExecuted ? 0 : index.labels + 1;
      if (!object.locked) {
        for (let l = initialLabelIndex; l < object.labels.length; l++) {
          const currIndices = { images: i, objects: o, labels: l };
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
            // break label_loop;
          }
        }
      }
      objectLoopExecuted = true;
    }
    imageLoopExecuted = true;
  }
};

const findPreviousLabel = (images, index) => {
  // need to seed the nested for loops with current indices,
  // but after the first loops have completed,
  // use last item as initial index
  let imageLoopExecuted = false,
    objectLoopExecuted = false;

  label_loop:
  for (let i = index.images; i >= 0; i--) {
    const image = images[i];
    const initialObjectIndex = imageLoopExecuted
      ? image.objects.length - 1
      : index.objects;

    for (let o = initialObjectIndex; o >= 0; o--) {
      const object = image.objects[o];
      const initialLabelIndex = objectLoopExecuted
        ? object.labels.length - 1
        : index.labels - 1;

      if (!object.locked) {
        for (let l = initialLabelIndex; l >= 0; l--) {
          const currIndices = { images: i, objects: o, labels: l };
          if (!isLabelInvalidated(images, currIndices)) {
            return currIndices;
            // break label_loop;
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
    const index = selectIndex(store.getState());

    // If not review mode, just inc/decrement image
    if (!reviewMode) {
      if (delta === 'decrement' && index.images > 0) {
        store.dispatch(setIndices({ images: index.images - 1 }));
      }
      else if (delta === 'increment' && index.images <= images.length) {
        store.dispatch(setIndices({ images: index.images + 1 }));
      }
    }
    // Else, it's in review mode, and we need to inc/decrement the label
    else {
      const newIndices = (delta === 'increment')
        ? findNextLabel(images, index)
        : findPreviousLabel(images, index);
        store.dispatch(setIndices(newIndices));
    }

    // TODO: also stop at empty images (or have this be a setting?)

    // TODO: figure out if the image record has been altered 
    // (e.g. labels validated) and save it



  }

  next(action);
};