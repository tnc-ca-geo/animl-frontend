import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './rootReducer';
import { preFocusImageMiddleware } from '../features/images/imagesMiddleware';
import { 
  setSelectedViewMiddleware,
  diffFiltersMiddleware
} from '../features/views/viewsMiddleware';
import { reviewMiddleware } from '../features/review/reviewMiddleware';

export const history = createBrowserHistory();

const store = configureStore({
  reducer: createRootReducer(history),
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware()
      .concat(routerMiddleware(history))
      .concat(preFocusImageMiddleware)
      .concat(diffFiltersMiddleware)
      .concat(setSelectedViewMiddleware)
      .concat(reviewMiddleware)
  ),
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const createNewRootReducer = require('./rootReducer').default;
    store.replaceReducer(createNewRootReducer(history));
  })
}

export default store;
