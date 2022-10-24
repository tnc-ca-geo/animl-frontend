import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import { undoHistoryReducer } from 'redux-undo-redo';
import userSlice from '../features/user/userSlice';
import filtersReducer from '../features/filters/filtersSlice';
import imagesReducer from '../features/images/imagesSlice';
import camerasReducer from '../features/cameras/camerasSlice';
import reviewReducer from '../features/review/reviewSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import projectReducer from '../features/projects/projectsSlice';
import trackingReducer from '../features/tracking/trackingSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  user: userSlice,
  projects: projectReducer,
  filters: filtersReducer,
  images: imagesReducer,
  cameras: camerasReducer,
  review: reviewReducer,
  loupe: loupeReducer,
  undoHistory: undoHistoryReducer, 
  tracking: trackingReducer,
});

export default createRootReducer;