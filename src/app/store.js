import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import createRootReducer from './rootReducer';
import { 
  diffFiltersMiddleware,
  normalizeDatesMiddleware,
  setSelectedViewMiddleware,
} from '../features/views/viewsMiddlewares';
import {
  incrementLoupeIndexMiddleware
} from '../features/loupe/loupeMiddlewares';

export const history = createBrowserHistory();

const store = configureStore({
  reducer: createRootReducer(history),
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware()
      .concat(diffFiltersMiddleware)
      .concat(normalizeDatesMiddleware)
      .concat(setSelectedViewMiddleware)
      .concat(incrementLoupeIndexMiddleware)
  ),
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const createNewRootReducer = require('./rootReducer').default;
    store.replaceReducer(createNewRootReducer(history));
  })
}

export default store;
