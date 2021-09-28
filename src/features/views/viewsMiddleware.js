import _ from 'lodash';
import { 
  selectRouterLocation,
  fetchImageContext,
  preFocusImageStart,
} from '../images/imagesSlice';
import {
  setActiveFilters,
  checkboxFilterToggled,
  dateFilterChanged,
  reviewFilterToggled,
  selectActiveFilters
} from '../filters/filtersSlice';
import {
  setSelectedView,
  saveViewSuccess,
  setUnsavedChanges,
  selectSelectedView
} from './viewsSlice';

const checkIfValidMD5Hash = (hash) => {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
};

// Track whether active filters match selected view filters
export const diffFiltersMiddleware = store => next => action => {
  if (checkboxFilterToggled.match(action) ||
      dateFilterChanged.match(action) ||
      reviewFilterToggled.match(action) ||
      setSelectedView.match(action) ||
      saveViewSuccess.match(action)) {
    
    next(action);
    const activeFilters = selectActiveFilters(store.getState());
    const selectedView = selectSelectedView(store.getState());
    if (activeFilters && selectedView) {
      const match = _.isEqual(activeFilters, selectedView.filters);
      store.dispatch(setUnsavedChanges(!match));
    }

  }
  else {
    next(action)
  }
};

// If an image Id has been passed into the URL as a query param, 
// initialize app  with pre-focused image. 
// Otherwise apply selected view's filters to active filters
export const setSelectedViewMiddleware = store => next => action => {
  if (setSelectedView.match(action)) {

    const routerLocation = selectRouterLocation(store.getState());
    const query = routerLocation.query;
    if ('img' in query && checkIfValidMD5Hash(query.img)) {
      // if there's an image id in the URL, fetch image and image's context
      store.dispatch(preFocusImageStart(query.img));
      store.dispatch(fetchImageContext(query.img));
    }
    else {
      // else, set active filters to selected view filters 
      const newFilters = action.payload.view.filters;
      store.dispatch(setActiveFilters(newFilters));
    }
    next(action);

  }
  else {
    next(action);
  }
};
