import { combineReducers } from '@reduxjs/toolkit';
import { connectRouter } from 'connected-react-router';
import uiReducer from '../features/ui/uiSlice';
import counterReducer from '../features/counter/counterSlice';
import imagesReducer from '../features/imageExplorer/imagesSlice';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  ui: uiReducer,
  images: imagesReducer,
  counter: counterReducer,
});

export default createRootReducer;