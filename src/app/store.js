import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './rootReducer';
import { preFocusImage } from '../features/images/imagesMiddleware';
import { 
  enrichProjAndViewPayload,
  setActiveFiltersToSelectedView,
  diffFilters
} from '../features/projects/projectsMiddleware';
import { focusMiddleware } from '../features/review/focusMiddleware';
import { labelMiddleware } from '../features/review/labelMiddleware';
import { objectMiddleware } from '../features/review/objectMiddleware';
import { undoMiddleware } from '../features/review/undoMiddleware';

export const history = createBrowserHistory();

const store = configureStore({
  reducer: createRootReducer(history),
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware()
      .concat(routerMiddleware(history))
      .concat(enrichProjAndViewPayload)
      .concat(preFocusImage)
      .concat(diffFilters)
      .concat(setActiveFiltersToSelectedView)
      .concat(focusMiddleware)
      .concat(labelMiddleware)
      .concat(objectMiddleware)
      .concat(undoMiddleware)
  ),
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    const createNewRootReducer = require('./rootReducer').default;
    store.replaceReducer(createNewRootReducer(history));
  })
}

export default store;
