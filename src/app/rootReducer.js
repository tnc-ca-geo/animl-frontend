import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import counterReducer from '../features/counter/counterSlice';
import imagesReducer from '../features/imagesExplorer/imagesSlice';
import filtersReducer from '../features/filters/filtersSlice';
import viewsReducer from '../features/views/viewsSlice';
import detailsModalReducer from '../features/detailsModal/detailsModalSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  images: imagesReducer,
  filters: filtersReducer,
  views: viewsReducer,
  detailsModal: detailsModalReducer,
  counter: counterReducer,
});

export default createRootReducer;