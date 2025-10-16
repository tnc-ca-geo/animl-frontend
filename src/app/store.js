import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './rootReducer';
import { preFocusImage } from '../features/images/imagesMiddleware';
import {
  enrichProjAndViewPayload,
  setActiveFiltersToSelectedView,
  diffFilters,
} from '../features/projects/projectsMiddleware';
import { focusMiddleware } from '../features/review/focusMiddleware';
import { labelMiddleware } from '../features/review/labelMiddleware';
import { objectMiddleware } from '../features/review/objectMiddleware';
import { tagMiddleware } from '../features/review/tagMiddleware';
import { undoMiddleware } from '../features/review/undoMiddleware';
import { trackingMiddleware } from '../features/tracking/trackingMiddleware';

export const history = createBrowserHistory();

const store = configureStore({
  reducer: createRootReducer(history),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(routerMiddleware(history))
      .concat(enrichProjAndViewPayload)
      .concat(preFocusImage)
      .concat(diffFilters)
      .concat(setActiveFiltersToSelectedView)
      .concat(focusMiddleware)
      .concat(labelMiddleware)
      .concat(tagMiddleware)
      .concat(objectMiddleware)
      .concat(undoMiddleware)
      .concat(trackingMiddleware),
});

export default store;
