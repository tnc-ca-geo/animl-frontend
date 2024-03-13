import { selectWorkingImages, setFocus } from '../review/reviewSlice';
import { toggleOpenLoupe } from '../loupe/loupeSlice';
import { getImagesSuccess, selectPreFocusImage, preFocusImageEnd } from './imagesSlice';

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
