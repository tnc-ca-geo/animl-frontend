import _ from 'lodash';
import { 
  selectRouterLocation,
  fetchImageContext,
  preFocusImageStart,
} from '../images/imagesSlice';
import {
  setActiveFilters,
  bulkSelectToggled,
  checkboxFilterToggled,
  dateFilterChanged,
  reviewFilterToggled,
  selectActiveFilters,
  customFilterChanged,
} from '../filters/filtersSlice';
import {
  setSelectedProjAndView,
  saveViewSuccess,
  selectSelectedView,
  setUnsavedViewChanges,
  editDeploymentsSuccess
} from './projectsSlice'

const checkIfValidMD5Hash = (hash) => {
  const regexExp = /^[a-f0-9]{32}$/gi;
  return regexExp.test(hash);
};

// TODO AUTH - update this to trigger checks on actions from new project slice

// Track whether active filters match selected view filters
export const diffFiltersMiddleware = store => next => action => {
  if (bulkSelectToggled.match(action) ||
      checkboxFilterToggled.match(action) ||
      dateFilterChanged.match(action) ||
      reviewFilterToggled.match(action) ||
      customFilterChanged.match(action) ||
      setSelectedProjAndView.match(action) ||
      editDeploymentsSuccess.match(action) ||
      saveViewSuccess.match(action)) {

    next(action);

    const activeFilters = selectActiveFilters(store.getState());
    const selectedView = selectSelectedView(store.getState());

    if (activeFilters && selectedView) {
      const match = _.isEqual(activeFilters, selectedView.filters);
      store.dispatch(setUnsavedViewChanges(!match));
    }

  }
  else {
    next(action)
  }
};

// If an image Id has been passed into the URL as a query param, 
// initialize app with pre-focused image. 
// Otherwise apply selected view's filters to active filters
// TODO - this is kind of a wierd place to check router params and override 
// setting selected view, but I think we're trying to wait for filters to be 
// ready before either setting them or doing a fetchImageContext (which also 
// sets active filters declaratively). 
export const setSelectedProjAndViewMiddleware = store => next => action => {
  if (setSelectedProjAndView.match(action)) {

    const routerLocation = selectRouterLocation(store.getState());
    const query = routerLocation.query;
    if ('img' in query && checkIfValidMD5Hash(query.img)) {
      // if there's an image id in the URL, fetch image and image's context
      console.log('setSelectedProjAndViewMiddleware() - img detected in URL')
      store.dispatch(preFocusImageStart(query.img));
      store.dispatch(fetchImageContext(query.img));
      next(action);
    }
    else {
      // else, set active filters to selected view filters
      console.log('setSelectedProjAndViewMiddleware() - NO img detected in URL');
      next(action);
      const newFilters = action.payload.view.filters;
      store.dispatch(setActiveFilters(newFilters));
    }

  }
  else {
    next(action);
  }
};
