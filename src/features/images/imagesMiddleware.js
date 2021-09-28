import { push } from 'connected-react-router';
import { selectWorkingImages, setFocus } from '../review/reviewSlice';
import { toggleOpenLoupe } from '../loupe/loupeSlice';
import {
  getImagesSuccess,
  selectPreFocusImage,
  preFocusImageEnd
} from './imagesSlice';

// After successful image fetch, check to see whether we should
// set the focus on a specific image
export const preFocusImageMiddleware = store => next => action => {
  if (getImagesSuccess.match(action)) {

    next(action);
    const imgId = selectPreFocusImage(store.getState())
    if (imgId) {
      const workingImages = selectWorkingImages(store.getState());
      const imgIndex = workingImages.findIndex((img) => img._id === imgId);
      store.dispatch(setFocus({ image: imgIndex }));
      store.dispatch(toggleOpenLoupe(true));
      store.dispatch(preFocusImageEnd());
      store.dispatch(push('/')); // remove URL query string 
    }
    
  }
  else {
    next(action);
  }
};
