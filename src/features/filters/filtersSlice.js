import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
  getCameras,
  getLabels,
  getViews
} from '../../api/animlAPI';
import moment from 'moment';
import {
  DATE_FORMAT_EXIF as DFE,
  DATE_FORMAT_READABLE as DFR,
} from '../../config';

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
    isLoading: false,
    error: null,
  },
};

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

    getViewsStart: (state) => { state.isLoading = true; },

    getViewsFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getViewsSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      const viewsInState = state.views.views.map((view) => view._id);
      payload.views.forEach((view) => {
        if (!viewsInState.includes(view._id)) {
          view.selected = view.name === "All images";
          state.views.views.push(view);
        }
      });
    },

    checkboxFilterToggled: (state, { payload }) => {
      const activeFilters = state.activeFilters[payload.filter];
      const availFilters = state.availFilters[payload.filter][payload.key];
      if (activeFilters === null) {
        // null = all filters are selected, so toggling one = unselecting it
        state.activeFilters[payload.filter] = availFilters.filter((f) => {
          return f !== payload.val;
        });
      }
      else if (activeFilters.includes(payload.val)) {
        state.activeFilters[payload.filter] = activeFilters.filter((f) => {
          return f !== payload.val;
        });
      }
      else {
        state.activeFilters[payload.filter].push(payload.val);
      }
    },

    dateFilterChanged: (state, { payload }) => {
      state.activeFilters[payload.type + 'Start'] = payload.startDate;
      state.activeFilters[payload.type + 'End'] = payload.endDate;
    },

    setSelectedView: (state, { payload }) => {
      console.log('setSelectedView action caught by filtersSlice: ', payload);
      // state.selectedViewMatchesFilters = true;
      state.views.views.forEach((view) => {
        console.log('view: ', view._id);
        view.selected = view._id === payload._id;
      });
      state.activeFilters = payload.filters;
    },

  },
});

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
  checkboxFilterToggled,
  dateFilterChanged,
  setSelectedView,
} = filtersSlice.actions;

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    dispatch(getCamerasStart());
    const cameras = await getCameras();
    console.log(cameras)
    dispatch(getCamerasSuccess(cameras))
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()))
  }
};

// fetchLabels thunk
export const fetchLabels = () => async dispatch => {
  try {
    dispatch(getLabelsStart());
    const labels = await getLabels();
    dispatch(getLabelsSuccess(labels))
  } catch (err) {
    dispatch(getLabelsFailure(err.toString()))
  }
};

// fetchViews thunk
export const fetchViews = () => async dispatch => {
  try {
    dispatch(getViewsStart());
    const views = await getViews();
    dispatch(getViewsSuccess(views))
  } catch (err) {
    dispatch(getViewsFailure(err.toString()))
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

export default filtersSlice.reducer;
