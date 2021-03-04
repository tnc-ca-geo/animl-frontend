
import { labelAdded } from './imagesSlice';
import {
  setIndices,
  incrementIndex,
  selectReviewMode
} from '../loupe/loupeSlice';

export const labelAddedMiddleware = store => next => action => {

  if (labelAdded.match(action)) {
    console.log('label added')
    next(action);

    store.dispatch(setIndices({ labels: 0 }));

    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) {
      store.dispatch(incrementIndex('increment'));
    }
    // TODO: send request to backend to save new label to object
    // TODO: add label category to label filters list? 
  } else {
    next(action);
  }

};