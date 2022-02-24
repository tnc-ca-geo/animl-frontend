import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
// import { createUndoMiddleware } from 'redux-undo-redo';
import createRootReducer from './rootReducer';
import { preFocusImageMiddleware } from '../features/images/imagesMiddleware';
import { 
  setSelectedViewMiddleware,
  diffFiltersMiddleware
} from '../features/projects/viewsMiddleware';
import { projectsMiddleware } from '../features/projects/projectsMiddleware';
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
      .concat(projectsMiddleware)
      .concat(preFocusImageMiddleware)
      .concat(diffFiltersMiddleware)
      .concat(setSelectedViewMiddleware)
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
