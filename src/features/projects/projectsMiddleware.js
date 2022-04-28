import _ from 'lodash';
import { actions as undoActions } from 'redux-undo-redo'
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
  selectProjects,
  setSelectedProjAndView,
  saveViewSuccess,
  selectSelectedView,
  setUnsavedViewChanges,
  editDeploymentsSuccess,
  deleteViewSuccess
} from './projectsSlice'


// enrich newly selected project and view payload
export const enrichProjAndViewPayload = store => next => action => {

  if (setSelectedProjAndView.match(action)) {
    console.log('projectsMiddleware() - enrichProjectAndViewPayload: ', action.payload);

    let { projId, viewId } = action.payload;

    // add project to payload (used in filtersSlice extraReducers)
    const projects = selectProjects(store.getState());
    const projToSelect = projects.find((proj) => proj._id === projId);
    action.payload.project = projToSelect;

    // add default viewId to payload if not specified in payload
    if (!viewId) {
      const defaultView = projToSelect.views.find((v) => v.name === 'All images');
      action.payload.viewId = defaultView._id;
      viewId = defaultView._id;
    }

    // find and add view to payload (used in setSelectedViewMiddleware)
    projects.forEach((p) => {
      p.views.forEach((v) => {
        if (v._id === viewId) action.payload.view = v;
      });
    });

    // indicate whether there will be a view and/or project change
    const currSelectedProj = projects.find((p) => p.selected);
    if (currSelectedProj) {
      const currSelectedView = currSelectedProj.views.find((v) => v.selected);
      action.payload.newProjSelected = currSelectedProj._id !== projId; 
      action.payload.newViewSelected = currSelectedView._id !== viewId; 
    }
    else {
      // we're setting selected project for the first time
      action.payload.newProjSelected = true; 
      action.payload.newViewSelected = true; 
    }
    
    next(action);
  }

  else {
    next(action);
  }

};

// track whether active filters match selected view filters
export const diffFilters = store => next => action => {
  if (
    setActiveFilters.match(action) ||
    bulkSelectToggled.match(action) ||
    checkboxFilterToggled.match(action) ||
    dateFilterChanged.match(action) ||
    reviewFilterToggled.match(action) ||
    customFilterChanged.match(action) ||
    setSelectedProjAndView.match(action) ||
    editDeploymentsSuccess.match(action) ||
    saveViewSuccess.match(action) ||
    deleteViewSuccess.match(action)
  ) {

    console.log('projectsMiddleware() - difFiltersMiddleware - payload: ', action.payload);

    next(action);
    const activeFilters = selectActiveFilters(store.getState());
    const selectedView = selectSelectedView(store.getState());
    if (activeFilters && selectedView) {
      console.log('projectsMiddleware() - difFiltersMiddleware - activeFilters: ', activeFilters)
      console.log('projectsMiddleware() - difFiltersMiddleware - selectedView filters: ', selectedView.filters)

      const match = _.isEqual(activeFilters, selectedView.filters);
      store.dispatch(setUnsavedViewChanges(!match));
    }

  }
  
  else {
    next(action)
  }
};

// clear undo/redo history and apply selected view's filters to active filters
// TODO: should we also do this when user clicks 'refresh button'? 
// e.g. if any action reversions depend on focus index we should.
export const setActiveFiltersToSelectedView = store => next => action => {

  if (setSelectedProjAndView.match(action)) {
    console.log('projectsMiddleware() - setActiveViewFilters: ', action.payload);
    store.dispatch(undoActions.clear());

    next(action);
    const newFilters = action.payload.view.filters;
    store.dispatch(setActiveFilters(newFilters));
  }

  else {
    next(action);
  }
};
