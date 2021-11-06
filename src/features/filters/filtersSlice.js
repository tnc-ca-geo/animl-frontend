import { createSlice, createSelector } from '@reduxjs/toolkit';
import { labelAdded } from '../review/reviewSlice';
import {
  getCamerasStart,
  getCamerasFailure,
  getCamerasSuccess,
  editDeploymentsSuccess,
} from '../cameras/camerasSlice';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { normalizeFilters } from './utils';

// TODO: come up with some standard names for components of the fitlters state
// and make consistent thoughout code
// are "cameras", "deployments", etc. "filters"? 
// I think yes (but I've been calling them "filter categories" in the code. Maybe "filter name is better")
// but what might call the individual IDs within filters that have arrays...
// "includedId"?

const initialState = {
  availFilters: {
    cameras: {
      ids: [],
      isLoading: false,
      noneFound: false,
      error: null,
    },
    deployments: {
      ids: [],
      isLoading: false,
      noneFound: false,
      error: null,
    },
    labels: {
      ids: [],
      isLoading: false,
      noneFound: false,
      error: null,
    }
  },
  activeFilters: {
    cameras: null,
    deployments: null,
    labels: null,
    createdStart: null,
    createdEnd: null,
    addedStart: null,
    addedEnd: null,
    reviewed: null,
  },
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {

    getLabelsStart: (state) => { state.availFilters.labels.isLoading = true; },

    getLabelsFailure: (state, { payload }) => {
      state.availFilters.labels.isLoading = false;
      state.availFilters.labels.error = payload;
    },

    getLabelsSuccess: (state, { payload }) => {
      state.availFilters.labels.isLoading = false;
      state.availFilters.labels.error = null;
      payload.labels.categories.forEach((cat) => {
        if (!state.availFilters.labels.ids.includes(cat)) {
          state.availFilters.labels.ids.push(cat);
        }
      });
      if (payload.labels.categories.length === 0) {
        state.availFilters.labels.noneFound = true;
      }
    },

    checkboxFilterToggled: (state, { payload }) => {
      const { filterCat, val } = payload;
      const activeIds = state.activeFilters[filterCat];
      const availIds = state.availFilters[filterCat].ids;

      if (activeIds === null) {
        // if null, all filters are selected, so toggling one = unselecting it
        state.activeFilters[filterCat] = availIds.filter((id) => {
          return id !== val;
        });
      }
      else {
        // add/remove item from active filters
        state.activeFilters[filterCat] = activeIds.includes(val)
          ? activeIds.filter((id) => id !== payload.val)
          : activeIds.concat([payload.val]);

        state.activeFilters = normalizeFilters(
          state.activeFilters,
          state.availFilters,
          [filterCat]
        );
      }
    },

    reviewFilterToggled: (state, { payload }) => {
      const reviewedFilter = state.activeFilters[payload.type];
      state.activeFilters[payload.type] = reviewedFilter === null 
        ? false 
        : null;
    },

    dateFilterChanged: (state, { payload }) => {
      state.activeFilters[payload.type + 'Start'] = payload.startDate;
      state.activeFilters[payload.type + 'End'] = payload.endDate;
    },

    setActiveFilters: (state, { payload }) => {
      const normalizedFilters = normalizeFilters(payload, state.availFilters);
      state.activeFilters = normalizedFilters;
    },

    bulkSelectToggled: (state, { payload }) => {
      const { currState, filterCat, managedIds } = payload;
      const activeIds = state.activeFilters[filterCat];
      const availIds = state.availFilters[filterCat].ids;
      let newActiveIds;

      if (currState === 'noneSelected') {
        // none are currently selected, so add all managedIds to activeFilters
        const idsToAdd = managedIds.filter((id) => !activeIds.includes(id));
        newActiveIds = activeIds.concat(idsToAdd);
      }
      else {
        // some or all managed ids are selected, so unselect all:
        // i.e, return all available Ids, minus the managed ids
        newActiveIds = (activeIds === null) 
          ? availIds.filter((id) => !managedIds.includes(id))
          : activeIds.filter((id) => !managedIds.includes(id));
      }

      state.activeFilters[payload.filterCat] = newActiveIds;
      state.activeFilters = normalizeFilters(
        state.activeFilters,
        state.availFilters,
        [filterCat]
      );
      
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(getCamerasStart, (state, { payload }) => {
        state.availFilters.cameras.isLoading = true;
        state.availFilters.deployments.isLoading = true;
      })          
      .addCase(getCamerasFailure, (state, { payload }) => {
        state.availFilters.cameras.isLoading = false;
        state.availFilters.cameras.error = payload;
  
        state.availFilters.deployments.isLoading = false;
        state.availFilters.deployments.error = payload;
      })      
      .addCase(getCamerasSuccess, (state, { payload }) => {
        // update deployment filters state
        state.availFilters.deployments.isLoading = false;
        state.availFilters.deployments.error = null;
        const depsInState = state.availFilters.deployments.ids;
        const newDeployments = payload.reduce((acc, camera) => {
          for (const dep of camera.deployments) {
            acc.push(dep);
          }
          return acc;
        },[]);
        
        for (const dep of newDeployments) {
          if (!depsInState.includes(dep._id)) {
            state.availFilters.deployments.ids.push(dep._id);
          }
        }
        
        // update camera filters state
        state.availFilters.cameras.isLoading = false;
        state.availFilters.cameras.error = null;
        const camsInState = state.availFilters.cameras.ids;
        for (const camera of payload) {
          if (!camsInState.includes(camera._id)) {
            state.availFilters.cameras.ids.push(camera._id);
          }
        }
        if (payload.length === 0) {
          state.availFilters.cameras.noneFound = true;
        }
      })
      .addCase(editDeploymentsSuccess, (state, { payload }) => {
        // update deployment filters state 
        const { camera, operation, reqPayload } = payload;
        state.availFilters.deployments.isLoading = false;
        state.availFilters.deployments.error = null;
        const availDepFilters = state.availFilters.deployments.ids;
        const activeDepFilters = state.activeFilters.deployments;
        switch (operation) {
          case 'createDeployment': {
            // add new dep to available deployment filters
            const newDepId = reqPayload.deployment._id;
            if (!availDepFilters) {
              state.availFilters.deployments.ids = [newDepId];
            }
            else if (!availDepFilters.includes(newDepId)) {
              state.availFilters.deployments.ids.push(newDepId);
            }
            // and active deployment filters
            if (activeDepFilters && 
                !activeDepFilters.includes(newDepId)) {
              state.activeFilters.deployments.push(newDepId);
            }
            break;
          }
          case 'deleteDeployment': {
            // remove deleted dep from available and active deployment filters
            state.availFilters.deployments.ids = availDepFilters.filter((id) => (
              id !== reqPayload.deploymentId
            ));
            state.activeFilters.deployments = activeDepFilters !== null
              ? activeDepFilters.filter((id) => id !== reqPayload.deploymentId)
              : null;
            break;
          }
          default: {
            const err = 'An operation is required';
            throw new Error(err);
          }
        }
      })
  }
});

// export actions from slice
export const {
  getLabelsStart,
  getLabelsSuccess,
  getLabelsFailure,
  getModelsSuccess,
  checkboxFilterToggled,
  reviewFilterToggled,
  dateFilterChanged,
  setActiveFilters,
  bulkSelectToggled,
} = filtersSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

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
export const selectAvailFilters = state => state.filters.availFilters;
export const selectAvailCameras = state => state.filters.availFilters.cameras;
export const selectAvailDeployments = state => state.filters.availFilters.deployments;
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
