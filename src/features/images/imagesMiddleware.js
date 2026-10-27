import { actions as undoActions } from 'redux-undo-redo';
import { selectWorkingImages, setFocus } from '../review/reviewSlice';
import { toggleOpenLoupe } from '../loupe/loupeSlice';
import {
  clearImages,
  getImagesSuccess,
  selectPreFocusImage,
  preFocusImageEnd,
} from './imagesSlice';

export const preFocusImage = (store) => (next) => (action) => {
  // After successful image fetch
  if (getImagesSuccess.match(action)) {
    next(action);

    // if there's a pre focused image, focus it
    const imgId = selectPreFocusImage(store.getState());
    if (imgId) {
      const workingImages = selectWorkingImages(store.getState());
      const imgIndex = workingImages.findIndex((img) => img._id === imgId);
      store.dispatch(setFocus({ index: { image: imgIndex }, type: 'auto' }));
      store.dispatch(toggleOpenLoupe(true));
      store.dispatch(preFocusImageEnd());
    }
  } else {
    next(action);
  }
};

/**
 * Undo/redo entries reference images by id, so they only stay replayable for as
 * long as the images they describe are loaded. `clearImages` replaces
 * `workingImages` wholesale, which can leave entries pointing at images that
 * are no longer in the table - replaying one throws in `findObject`.
 *
 * Clearing the history here rather than at each call site covers every path
 * that drops the loaded images: refreshing Project data, switching Project or
 * View, and changing filters or sort order (`fetchImages` clears before
 * committing any page other than 'next', so paginating keeps its history).
 */
export const clearUndoHistoryWithImages = (store) => (next) => (action) => {
  if (clearImages.match(action)) {
    next(action);
    store.dispatch(undoActions.clear());
  } else {
    next(action);
  }
};
