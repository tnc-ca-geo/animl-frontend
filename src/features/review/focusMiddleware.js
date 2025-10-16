import { setFocus, incrementImage, selectFocusIndex, selectWorkingImages } from './reviewSlice';
import { selectIsAddingLabel } from '../loupe/loupeSlice';

export const focusMiddleware = (store) => (next) => (action) => {
  if (setFocus.match(action)) {
    /* setFocus */
    // prevent any focus change while user isAddingLabel
    const isAddingLabel = selectIsAddingLabel(store.getState());
    if (!isAddingLabel) next(action);
  } else if (incrementImage.match(action)) {
    /* incrementImage */
    next(action);
    const delta = action.payload;
    const workingImages = selectWorkingImages(store.getState());
    const focusIndex = selectFocusIndex(store.getState());
    const focusedOnFirstImg = focusIndex.image === 0;
    const focusedOnLastImg = focusIndex.image === workingImages.length - 1;

    if (delta === 'decrement' && !focusedOnFirstImg) {
      store.dispatch(
        setFocus({
          index: { image: focusIndex.image - 1, object: null, label: null },
          type: 'auto',
        }),
      );
    } else if (delta === 'increment' && !focusedOnLastImg) {
      store.dispatch(
        setFocus({
          index: { image: focusIndex.image + 1, object: null, label: null },
          type: 'auto',
        }),
      );
    }
  } else {
    next(action);
  }
};
