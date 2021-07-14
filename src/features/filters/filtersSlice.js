import { createSlice, createSelector } from '@reduxjs/toolkit';
import { labelAdded } from '../review/reviewSlice';
import { call } from '../../api';
import { Auth } from 'aws-amplify';

const initialState = {
  availFilters: {
    cameras: {
      ids: [],
      isLoading: false,
      noneFound: false,
      error: null,
    },
    labels: {
      categories: [],
      isLoading: false,
      noneFound: false,
      error: null,
    }
  },
  activeFilters: {
    cameras: null,
    labels: null,
    createdStart: null,
    createdEnd: null,
    addedStart: null,
    addedEnd: null,
    reviewed: true,
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
      if (payload.cameras.length === 0) {
        state.availFilters.cameras.noneFound = true;
      }
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
      if (payload.labels.categories.length === 0) {
        state.availFilters.labels.noneFound = true;
      }
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

    reviewFilterToggled: (state, { payload }) => {
      state.activeFilters[payload.type] = !state.activeFilters[payload.type];
    },

    dateFilterChanged: (state, { payload }) => {
      state.activeFilters[payload.type + 'Start'] = payload.startDate;
      state.activeFilters[payload.type + 'End'] = payload.endDate;
    },

    setActiveFilters: (state, { payload }) => {
      state.activeFilters = payload;
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
  getModelsSuccess,
  checkboxFilterToggled,
  reviewFilterToggled,
  dateFilterChanged,
  setActiveFilters,
} = filtersSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if(token){
      dispatch(getCamerasStart());
      const cameras = await call('getCameras');
      dispatch(getCamerasSuccess(cameras));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()));
  }
};

// fetchLabels thunk
export const fetchLabels = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if(token){
      dispatch(getLabelsStart());
      const labels = await call('getLabels');
      dispatch(getLabelsSuccess(labels));
    }
  } catch (err) {
    dispatch(getLabelsFailure(err.toString()))
  }
};

// Selectors
export const selectActiveFilters = state => state.filters.activeFilters;
export const selectAvailCameras = state => state.filters.availFilters.cameras;
export const selectAvailLabels = state => state.filters.availFilters.labels;
export const selectReviewed = state => state.filters.activeFilters.reviewed;
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

export default filtersSlice.reducer;
