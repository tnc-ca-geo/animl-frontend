import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import { undoHistoryReducer } from 'redux-undo-redo';
import userSlice from '../features/user/userSlice';
import filtersReducer from '../features/filters/filtersSlice';
import imagesReducer from '../features/images/imagesSlice';
import camerasReducer from '../features/cameras/camerasSlice';
import reviewReducer from '../features/review/reviewSlice';
import viewsReducer from '../features/views/viewsSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import projectsSlice from '../features/projects/projectsSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  user: userSlice,
  projects: projectsSlice,
  filters: filtersReducer,
  images: imagesReducer,
  cameras: camerasReducer,
  review: reviewReducer,
  views: viewsReducer,
  loupe: loupeReducer,
  undoHistory: undoHistoryReducer, 
});

export default createRootReducer;