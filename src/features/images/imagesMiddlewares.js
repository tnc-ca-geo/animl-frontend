
import { clearImages, getImagesSuccess } from './imagesSlice';
import { clearObjects, syncObjects } from '../review/reviewSlice';

export const imagesMiddleware = store => next => action => {

  if (clearImages.match(action)) {
    // clear objects out of review slice
    store.dispatch(clearObjects(action));
    next(action);
  }

  if (getImagesSuccess.match(action)) {
    // add objects to review slice
    store.dispatch(syncObjects(action));
    next(action);
  }

  else {
    next(action);
  }

};