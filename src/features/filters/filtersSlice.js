import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';
import _ from 'lodash';
import moment from 'moment';
import { DATE_FORMAT_EXIF as DFE } from '../../config';

const initialState = {
  availFilters: {
    cameras: {
      ids: [],
      isLoading: false,
      error: null,
    },
    labels: {
      categories: [],
      isLoading: false,
      error: null,
    }
  },
  activeFilters: {
    cameras: null,
    labels: null,
    createdStart: null,
    createdEnd: null,
    addedStart: null,
    addedEnd: null
  },
  views: {
    views: [],
    unsavedChanges: false,
    isLoading: false,
    error: null,
  },
};

// TODO: figure out how to break this slice up
export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {

    getCamerasStart: (state) => {
      state.availFilters.cameras.isLoading = true;
    },

    getCamerasFailure: (state, { payload }) => {
      state.availFilters.cameras.isLoading = false;
      state.availFilters.cameras.error = payload;
    },

    getCamerasSuccess: (state, { payload }) => {
      state.availFilters.cameras.isLoading = false;
      state.availFilters.cameras.error = null;
      const camsInState = state.availFilters.cameras.ids;
      payload.cameras.forEach((camera) => {
        if (!camsInState.includes(camera._id)) {
          state.availFilters.cameras.ids.push(camera._id);
        }
      });
    },

    getLabelsStart: (state) => { state.availFilters.labels.isLoading = true; },

    getLabelsFailure: (state, { payload }) => {
      state.availFilters.labels.isLoading = false;
      state.availFilters.labels.error = payload;
    },

    getLabelsSuccess: (state, { payload }) => {
      // TODO: the getLabels and getCameras reducers (start, failure, success) 
      // could be generalized and consolodated
      state.availFilters.labels.isLoading = false;
      state.availFilters.labels.error = null;
      payload.labels.categories.forEach((cat) => {
        if (!state.availFilters.labels.categories.includes(cat)) {
          state.availFilters.labels.categories.push(cat);
        }
      });
    },

    getViewsStart: (state) => { state.views.isLoading = true; },

    getViewsFailure: (state, { payload }) => {
      state.views.isLoading = false;
      state.views.error = payload;
    },

    getViewsSuccess: (state, { payload }) => {
      state.views.isLoading = false;
      state.views.error = null;
      const viewsInState = state.views.views.map((view) => view._id);
      payload.views.forEach((view) => {
        if (!viewsInState.includes(view._id)) {
          view.selected = view.name === 'All images';
          state.views.views.push(view);
        }
      });
    },

    editViewStart: (state) => { state.views.isLoading = true; },

    editViewFailure: (state, { payload }) => {
      state.views.isLoading = false;
      state.views.error = payload;
    },

    saveViewSuccess: (state, { payload }) => {
      state.views.isLoading = false;
      state.views.error = null;
      let viewInState = false;
      state.views.views.forEach((view, i) => {
        if (view._id === payload._id) {
          viewInState = true;
          state.views.views[i] = payload;
        }
      });
      if (!viewInState) {
        state.views.views.push(payload);
      }
    },

    deleteViewSuccess: (state, { payload }) => {
      state.views.isLoading = false;
      state.views.error = null;
      state.views.views = state.views.views.filter((view) => {
        return view._id !== payload;
      });
    },

    setUnsavedChanges: (state, { payload }) => {
      state.views.unsavedChanges = payload;
    },

    checkboxFilterToggled: (state, { payload }) => {
      const activeFil = state.activeFilters[payload.filter];
      const availFil = state.availFilters[payload.filter][payload.key];
      if (activeFil === null) {
        // null = all filters are selected, so toggling one = unselecting it
        state.activeFilters[payload.filter] = availFil.filter((f) => {
          return f !== payload.val;
        });
      }
      else {
        // add/remove item from active filters
        state.activeFilters[payload.filter] = activeFil.includes(payload.val)
          ? activeFil.filter((f) => f !== payload.val)
          : activeFil.concat([payload.val])
        // If all available filters are selected, set to null
        const availCount = state.availFilters[payload.filter][payload.key].length;
        const activeCount = state.activeFilters[payload.filter].length;
        if (availCount === activeCount) {
          state.activeFilters[payload.filter] = null;
        }
      }
    },

    dateFilterChanged: (state, { payload }) => {
      state.activeFilters[payload.type + 'Start'] = payload.startDate;
      state.activeFilters[payload.type + 'End'] = payload.endDate;
    },

    setSelectedView: (state, { payload }) => {
      state.views.views.forEach((view) => {
        view.selected = view._id === payload._id;
      });
      state.activeFilters = payload.filters;
    },
    
  },
});

// export actions from slice
export const {
  getCamerasStart,
  getCamerasSuccess,
  getCamerasFailure,
  getLabelsStart,
  getLabelsSuccess,
  getLabelsFailure,
  getViewsStart,
  getViewsSuccess,
  getViewsFailure,
  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,
  setUnsavedChanges,
  checkboxFilterToggled,
  dateFilterChanged,
  setSelectedView,
} = filtersSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    dispatch(getCamerasStart());
    const cameras = await call('getCameras');
    dispatch(getCamerasSuccess(cameras))
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()))
  }
};

// fetchLabels thunk
export const fetchLabels = () => async dispatch => {
  try {
    dispatch(getLabelsStart());
    const labels = await call('getLabels');
    dispatch(getLabelsSuccess(labels))
  } catch (err) {
    dispatch(getLabelsFailure(err.toString()))
  }
};

// fetchViews thunk
export const fetchViews = () => async dispatch => {
  try {
    dispatch(getViewsStart());
    // const views = await getViews();
    const views = await call('getViews');
    dispatch(getViewsSuccess(views));
  } catch (err) {
    dispatch(getViewsFailure(err.toString()))
  }
};

// editView thunk
export const editView = ({ operation, payload }) =>
  async (dispatch, getState) => {
    try {
      dispatch(editViewStart());
      switch (operation) {
        case 'create': {
          // const res = await createView(payload);
          const res = await call('createView', payload);
          const view = res.createView.view;
          dispatch(saveViewSuccess(view));
          dispatch(setSelectedView(view));
          break;
        }
        case 'update': {
          // const res = await updateView(payload);
          const res = await call('updateView', payload);
          const view = res.updateView.view;
          dispatch(saveViewSuccess(view));
          dispatch(setSelectedView(view));
          break;
        }
        case 'delete': {
          // const res = await deleteView(payload);
          const res = await call('deleteView', payload);
          const views = getState().filters.views.views;
          const defaultView = views.filter((view) => {
            return view.name === 'All images';
          })[0];
          dispatch(setSelectedView(defaultView)); 
          dispatch(deleteViewSuccess(res.viewId));
          break;
        }
        default: {
          const err = 'An peration (create, update, or delete) is required';
          throw new Error(err);
        }
      }
    } catch (err) {
      console.log(`error attempting to ${operation} view: ${err.toString()}`);
      dispatch(editViewFailure(err.toString()));
    }
};

// Selectors
export const selectActiveFilters = state => state.filters.activeFilters;
export const selectAvailCameras = state => state.filters.availFilters.cameras;
export const selectAvailLabels = state => state.filters.availFilters.labels;
export const selectDateAddedFilter = state => ({
  start: state.filters.activeFilters.addedStart,
  end: state.filters.activeFilters.addedEnd,
});
export const selectDateCreatedFilter = state => ({
  start: state.filters.activeFilters.createdStart,
  end: state.filters.activeFilters.createdEnd,
});
export const selectFiltersReady = createSelector(
  [selectAvailCameras, selectAvailLabels],
  (cameras, labels) => {
    let ready = true;
    const fetchedFilters = [cameras, labels];
    fetchedFilters.forEach(filter => {
      if (filter.isLoading || filter.error) {
        ready = false;
      };
    })
    return ready;
  }
);
export const selectViews = state => state.filters.views;
export const selectSelectedView = createSelector(
  [selectViews],
  (views) => (
    views.views.filter((view) => view.selected)[0]
  )
);
export const selectUnsavedViewChanges = state => (
  state.filters.views.unsavedChanges
);

// Additional middlewares

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
    const dateFields = ['createdStart', 'createdEnd', 'addedStart', 'addedEnd'];
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

export default filtersSlice.reducer;
