import _ from 'lodash';
import { actions as undoActions } from 'redux-undo-redo';
import {
  setActiveFilters,
  bulkSelectToggled,
  checkboxFilterToggled,
  dateFilterChanged,
  reviewedFilterToggled,
  selectActiveFilters,
  customFilterChanged,
  checkboxOnlyButtonClicked,
} from '../filters/filtersSlice';
import {
  setSelectedProjAndView,
  saveViewSuccess,
  selectSelectedView,
  setUnsavedViewChanges,
  deleteViewSuccess,
} from './projectsSlice';
import { editDeploymentsSuccess } from '../tasks/tasksSlice';

// filter categories stored as arrays of ids
const ID_FILTER_CATEGORIES = ['cameras', 'deployments', 'labels', 'tags'];

// Toggling an id off and back on appends it to the end of the array, so the
// order of these arrays carries no meaning. Sort them before diffing, otherwise
// manually restoring a view's filters can leave the view looking "edited".
const sortIdFilters = (filters) =>
  _.mapValues(filters, (value, category) =>
    ID_FILTER_CATEGORIES.includes(category) && Array.isArray(value) ? [...value].sort() : value,
  );

const filtersMatch = (activeFilters, viewFilters) =>
  _.isEqual(sortIdFilters(activeFilters), sortIdFilters(viewFilters));

// track whether active filters match selected view filters
export const diffFilters = (store) => (next) => (action) => {
  if (
    setActiveFilters.match(action) ||
    bulkSelectToggled.match(action) ||
    checkboxFilterToggled.match(action) ||
    checkboxOnlyButtonClicked.match(action) ||
    dateFilterChanged.match(action) ||
    reviewedFilterToggled.match(action) ||
    customFilterChanged.match(action) ||
    setSelectedProjAndView.match(action) ||
    editDeploymentsSuccess.match(action) ||
    saveViewSuccess.match(action) ||
    deleteViewSuccess.match(action)
  ) {
    next(action);
    const activeFilters = selectActiveFilters(store.getState());
    const selectedView = selectSelectedView(store.getState());
    if (activeFilters && selectedView) {
      store.dispatch(setUnsavedViewChanges(!filtersMatch(activeFilters, selectedView.filters)));
    }
  } else {
    next(action);
  }
};

// clear undo/redo history and apply selected view's filters to active filters
// TODO: should we also do this when user clicks 'refresh button'?
// e.g. if any action reversions depend on focus index we should.
export const setActiveFiltersToSelectedView = (store) => (next) => (action) => {
  if (setSelectedProjAndView.match(action)) {
    store.dispatch(undoActions.clear());

    next(action);
    // read the newly selected view back out of state rather than off the action
    // payload, so callers only ever have to supply { projId, viewId }
    const selectedView = selectSelectedView(store.getState());
    if (selectedView) store.dispatch(setActiveFilters(selectedView.filters));
  } else {
    next(action);
  }
};
