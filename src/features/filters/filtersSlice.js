import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { registerCameraSuccess } from '../cameras/wirelessCamerasSlice';
import {
  getProjectsStart,
  getProjectsFailure,
  setSelectedProjAndView,
  editDeploymentsSuccess,
  createProjectLabelSuccess,
  updateProjectLabelSuccess,
  selectProjectsLoading,
  selectProjectLabelsLoading,
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
    labels: { options: [] }
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
  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        const { cameraConfigs, labels } = payload.project;
        updateAvailDepFilters(state, cameraConfigs);
        updateAvailCamFilters(state, cameraConfigs);
        updateAvailLabelFilters(state, labels);
        // set all filters to new selected view? We're currently handling this 
        // by dispatching setActiveFilters from setSelectedProjAndViewMiddleware
      })
      .addCase(createProjectLabelSuccess, (state, { payload }) => {
        const labels = [...state.availFilters.labels.options, payload.label];
        updateAvailLabelFilters(state, labels);
      })
      .addCase(updateProjectLabelSuccess, (state, { payload }) => {
        const labels = state.availFilters.labels.options.map((label) => {
          if (label._id === payload.label._id) {
            return payload.label;
          } else {
            return label;
          }
        });
        updateAvailLabelFilters(state, labels);
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
} = filtersSlice.actions;

// Selectors
export const selectActiveFilters = state => state.filters.activeFilters;
export const selectAvailFilters = state => state.filters.availFilters;
export const selectAvailCameras = state => state.filters.availFilters.cameras;
export const selectAvailDeployments = state => state.filters.availFilters.deployments;
export const selectAvailLabels = state => state.filters.availFilters.labels;
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

export default filtersSlice.reducer;
