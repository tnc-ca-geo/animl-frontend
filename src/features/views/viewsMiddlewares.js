import moment from 'moment';
import _ from 'lodash';
import {
  checkboxFilterToggled,
  dateFilterChanged,
  setActiveFilters,
  selectActiveFilters
} from '../filters/filtersSlice';
import {
  setSelectedView,
  saveViewSuccess,
  setUnsavedChanges,
  getViewsSuccess,
  selectSelectedView
} from './viewsSlice';
import { DATE_FORMAT_EXIF as DFE } from '../../config';

// Track whether active filters match selected view filters
export const diffFiltersMiddleware = store => next => action => {
  next(action);

  if (checkboxFilterToggled.match(action) ||
      dateFilterChanged.match(action) ||
      setSelectedView.match(action) ||
      saveViewSuccess.match(action)) {

    const activeFilters = selectActiveFilters(store.getState());
    const selectedView = selectSelectedView(store.getState());

    if (activeFilters && selectedView) {
      const match = _.isEqual(activeFilters, selectedView.filters);
      store.dispatch(setUnsavedChanges(!match));
    }
  }
};

export const normalizeDatesMiddleware = store => next => action => {
  const convertViewDates = (view) => {
    const dateFields = [
      'createdStart',
      'createdEnd',
      'addedStart',
      'addedEnd'
    ];
    dateFields.forEach((df) => {
      if (view.filters[df] !== null) {
        view.filters[df] = moment(view.filters[df]).format(DFE);
      }
    });
    return view;
  };

  if (getViewsSuccess.match(action)) {
    action.payload.views = action.payload.views.map((view) => (
      convertViewDates(view)
    ));
  }
  else if (saveViewSuccess.match(action)) {
    action.payload = convertViewDates(action.payload);
  }

  next(action);
};

export const setSelectedViewMiddleware = store => next => action => {
  if (setSelectedView.match(action)) {
    // TODO: think about passing old selected view into payload as well
    const selectedView = selectSelectedView(store.getState());
    if (selectedView._id !== action.payload.view._id) {

      action.payload.dirty = true;
      next(action);

      const newFilters = action.payload.view.filters;
      store.dispatch(setActiveFilters(newFilters));

    }
  }
  next(action);
};