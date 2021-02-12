import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import imagesReducer from '../features/images/imagesSlice';
import filtersReducer from '../features/filters/filtersSlice';
import viewsReducer from '../features/views/viewsSlice';
import loupeReducer from '../features/loupe/loupeSlice';
import counterReducer from '../features/counter/counterSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  images: imagesReducer,
  filters: filtersReducer,
  views: viewsReducer,
  loupe: loupeReducer,
  counter: counterReducer,
});

export default createRootReducer;