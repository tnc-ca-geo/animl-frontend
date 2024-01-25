import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { registerCameraSuccess } from '../cameras/wirelessCamerasSlice';
import {
  getProjectsStart,
  getProjectsFailure,
  setSelectedProjAndView,
  editDeploymentsSuccess,
  selectProjectsLoading,
} from '../projects/projectsSlice';
import {
  normalizeFilters,
  updateAvailCamFilters,
  updateAvailDepFilters,
  updateAvailLabelFilters,
} from './utils';

const initialState = {
  availFilters: {
    cameras: { ids: [] },
    deployments: { ids: [] },
    labels: {
      options: [],
      loadingState: {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: false,
      },
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
    notReviewed: null,
    custom: null,
  },
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {

    checkboxFilterToggled: (state, { payload }) => {
      const { filterCat, val } = payload;
      const activeIds = state.activeFilters[filterCat];
      const availIds = state.availFilters[filterCat].options.map(({ _id }) => _id);

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

    reviewedFilterToggled: (state, { payload }) => {
      const reviewedFilter = state.activeFilters[payload.type];
      state.activeFilters[payload.type] = (reviewedFilter === null) ? false : null;
    },

    notReviewedFilterToggled: (state, { payload }) => {
      const notReviewedFilter = state.activeFilters[payload.type];
      state.activeFilters[notReviewedFilter] = (notReviewedFilter === null) ? false : null;
    },

    customFilterChanged: (state, { payload }) => {
      state.activeFilters.custom = payload;
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
      const availIds = state.availFilters[filterCat].options.map(({id}) => id);
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

      state.activeFilters[filterCat] = newActiveIds;
      state.activeFilters = normalizeFilters(
        state.activeFilters,
        state.availFilters,
        [filterCat]
      );
      
    },

    checkboxOnlyButtonClicked: (state, { payload }) => {
      const { filterCat, managedIds } = payload;
      state.activeFilters[filterCat] = managedIds;
      state.activeFilters = normalizeFilters(
        state.activeFilters,
        state.availFilters,
        [filterCat]
      );
    },

    createProjectLabelStart: (state) => {
      const ls = { isLoading: true, operation: 'creating', errors: null };
      state.availFilters.labels.loadingState = ls;
    },

    createProjectLabelSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null
      };
      state.availFilters.labels.loadingState = ls;

      state.availFilters.labels.options = [
        ...state.availFilters.labels.options,
        payload.label
      ]
    },

    createProjectLabelFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload, stateMsg: null };
      state.availFilters.labels.loadingState = ls;
    },

    updateProjectLabelStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };
      state.availFilters.labels.loadingState = ls;
    },

    updateProjectLabelSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null
      };
      state.availFilters.labels.loadingState = ls;

      state.availFilters.labels.options = state.availFilters.labels.options.map((label) => {
        if (label._id === payload.label._id) {
          return payload.label;
        } else {
          return label;
        }
      });
    },

    updateLabelFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload, stateMsg: null };
      state.availFilters.labels.loadingState = ls;
    },

    dismissManageLabelsError: (state, { payload }) => {
      const index = payload;
      state.availFilters.labels.loadingState.errors.splice(index, 1);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getProjectsStart, (state, { payload }) => {
        let loadingState = state.availFilters.labels.loadingState;
        loadingState.isLoading = true; 
        loadingState.operation = 'fetching';
      })
      .addCase(getProjectsFailure, (state, { payload }) => {
        let loadingState = state.availFilters.labels.loadingState;
        loadingState.isLoading = false; 
        loadingState.operation = null; 
        loadingState.errors = payload;
      })
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        const { cameraConfigs, labels } = payload.project;
        updateAvailDepFilters(state, cameraConfigs);
        updateAvailCamFilters(state, cameraConfigs);
        updateAvailLabelFilters(state, labels);
        // set all filters to new selected view? We're currently handling this 
        // by dispatching setActiveFilters from setSelectedProjAndViewMiddleware
      })
      .addCase(registerCameraSuccess, (state, { payload }) => {
        const { cameraConfigs } = payload.project;
        updateAvailDepFilters(state, cameraConfigs);
        updateAvailCamFilters(state, cameraConfigs);
      })
      .addCase(editDeploymentsSuccess, (state, { payload }) => {
        const { operation, reqPayload } = payload;
        const availDepFilters = state.availFilters.deployments.ids;
        const activeDepFilters = state.activeFilters.deployments;
        switch (operation) {
          case 'updateDeployment': { break }
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
            state.activeFilters.deployments = (activeDepFilters !== null)
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

export const {
  getModelsSuccess,
  checkboxFilterToggled,
  reviewedFilterToggled,
  notReviewedFilterToggled,
  customFilterChanged,
  dateFilterChanged,
  setActiveFilters,
  bulkSelectToggled,
  checkboxOnlyButtonClicked,

  createProjectLabelStart,
  createProjectLabelSuccess,
  createProjectLabelFailure,

  updateProjectLabelStart,
  updateProjectLabelSuccess,
  updateLabelFailure,
  dismissManageLabelsError
} = filtersSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

export const updateProjectLabel = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateProjectLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'updateProjectLabel',
          input: payload
        });
        dispatch(updateProjectLabelSuccess({ projId, label: res.updateProjectLabel.label }));
      }
    } catch (err) {
      console.log(`error attempting to update label: `, err);
      dispatch(updateLabelFailure(err));
    }
  };
};

export const createProjectLabel = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(createProjectLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'createProjectLabel',
          input: payload
        });
        dispatch(createProjectLabelSuccess({ projId, label: res.createProjectLabel.label}));
      }
    } catch (err) {
      console.log(`error attempting to create label: `, err);
      dispatch(createProjectLabelFailure(err));
    }
  };
};

// Selectors
export const selectActiveFilters = state => state.filters.activeFilters;
export const selectAvailFilters = state => state.filters.availFilters;
export const selectAvailCameras = state => state.filters.availFilters.cameras;
export const selectAvailDeployments = state => state.filters.availFilters.deployments;
export const selectAvailLabels = state => state.filters.availFilters.labels;
export const selectLabelsLoading = state => state.filters.availFilters.labels.loadingState;
export const selectReviewed = state => state.filters.activeFilters.reviewed;
export const selectNotReviewed = state => state.filters.activeFilters.notReviewed;
export const selectCustomFilter = state => state.filters.activeFilters.custom;
export const selectDateAddedFilter = state => ({
  start: state.filters.activeFilters.addedStart,
  end: state.filters.activeFilters.addedEnd,
});
export const selectDateCreatedFilter = state => ({
  start: state.filters.activeFilters.createdStart,
  end: state.filters.activeFilters.createdEnd,
});
export const selectFiltersReady = createSelector(
  [selectProjectsLoading, selectLabelsLoading],
  (projectsLoading, labelsLoading) => {
    const dependencies = [projectsLoading, labelsLoading];
    return !dependencies.some(d => d.isLoading || d.errors);
  }
);
export const selectManageLabelsErrors = state => state.filters.availFilters.labels.loadingState.errors;

export default filtersSlice.reducer;
