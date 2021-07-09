
import { clearImages, getImagesSuccess } from './imagesSlice';
import { clearWorkingImages, syncWorkingImages } from '../review/reviewSlice';

// TODO: don't really need this anymore. remove

export const imagesMiddleware = store => next => action => {

  if (clearImages.match(action)) {
    // clear objects out of review slice
    // store.dispatch(clearWorkingImages(action));
    next(action);
  }

  if (getImagesSuccess.match(action)) {
    // add objects to review slice
    // store.dispatch(syncWorkingImages(action));
    next(action);
  }

  else {
    next(action);
  }

};