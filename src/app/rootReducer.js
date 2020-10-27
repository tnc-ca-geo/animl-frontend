import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import counterReducer from '../features/counter/counterSlice';
import imagesReducer from '../features/imageExplorer/imagesSlice';
import detailsModalReducer from '../features/detailsModal/DetailsModalSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  images: imagesReducer,
  detailsModal: detailsModalReducer,
  counter: counterReducer,
});

export default createRootReducer;