import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import userSlice from '../features/user/userSlice';
import imagesReducer from '../features/images/imagesSlice';
import filtersReducer from '../features/filters/filtersSlice';
import reviewReducer from '../features/review/reviewSlice';
import viewsReducer from '../features/views/viewsSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import counterReducer from '../features/counter/counterSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  user: userSlice,
  images: imagesReducer,
  filters: filtersReducer,
  review: reviewReducer,
  views: viewsReducer,
  loupe: loupeReducer,
  counter: counterReducer,
});

export default createRootReducer;