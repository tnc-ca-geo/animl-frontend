
import { labelAdded } from './imagesSlice';
import { setIndices, addObjectEnd } from '../loupe/loupeSlice';

export const labelAddedMiddleware = store => next => action => {

  if (labelAdded.match(action)) {
    next(action);
    store.dispatch(setIndices({ labels: 0 }));
    store.dispatch(addObjectEnd());
    // TODO: send request to backend to save new label to object
    // TODO: add label category to label filters list? 
  } else {
    next(action);
  }

};