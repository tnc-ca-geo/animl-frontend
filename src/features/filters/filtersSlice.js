import { createSlice } from '@reduxjs/toolkit';
import { registerCameraSuccess } from '../cameras/wirelessCamerasSlice';
import {
  setSelectedProjAndView,
  createProjectLabelSuccess,
  updateProjectLabelSuccess,
} from '../projects/projectsSlice';
import { editDeploymentsSuccess } from '../tasks/tasksSlice';
import {
  normalizeFilters,
  updateAvailCamFilters,
  updateAvailDepFilters,
  updateAvailLabelFilters,
} from './utils';

const initialState = {
  availFilters: {
    cameras: { options: [] },
    deployments: { options: [] },
    labels: { options: [] },
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
      } else {
        // add/remove item from active filters
        state.activeFilters[filterCat] = activeIds.includes(val)
          ? activeIds.filter((id) => id !== payload.val)
          : activeIds.concat([payload.val]);

        state.activeFilters = normalizeFilters(state.activeFilters, state.availFilters, [
          filterCat,
        ]);
      }
    },

    reviewedFilterToggled: (state, { payload }) => {
      state.activeFilters['reviewed'] = payload.reviewed;
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
      const availIds = state.availFilters[filterCat].options.map(({ _id }) => _id);
      let newActiveIds;

      if (currState !== 'allSelected') {
        // not all labels are currently selected, so add all managedIds to activeFilters
        const idsToAdd = managedIds.filter((id) => !activeIds.includes(id));
        newActiveIds = activeIds.concat(idsToAdd);
      } else {
        // all managed ids are selected, so unselect all:
        // i.e, return all available Ids, minus the managed ids
        newActiveIds =
          activeIds === null
            ? availIds.filter((id) => !managedIds.includes(id))
            : activeIds.filter((id) => !managedIds.includes(id));
      }

      state.activeFilters[filterCat] = newActiveIds;
      state.activeFilters = normalizeFilters(state.activeFilters, state.availFilters, [filterCat]);
    },

    checkboxOnlyButtonClicked: (state, { payload }) => {
      const { filterCat, managedIds } = payload;
      state.activeFilters[filterCat] = managedIds;
      state.activeFilters = normalizeFilters(state.activeFilters, state.availFilters, [filterCat]);
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
        const availDepFilters = state.availFilters.deployments.options.map(({ _id }) => _id);
        const activeDepFilters = state.activeFilters.deployments;
        switch (operation) {
          case 'updateDeployment': {
            break;
          }
          case 'createDeployment': {
            // add new dep to available deployment filters
            const newDepId = reqPayload.deployment._id;
            if (!availDepFilters) {
              state.availFilters.deployments.options = [{ _id: newDepId }];
            } else if (!availDepFilters.includes(newDepId)) {
              state.availFilters.deployments.options.push({ _id: newDepId });
            }
            // and active deployment filters
            if (activeDepFilters && !activeDepFilters.includes(newDepId)) {
              state.activeFilters.deployments.push(newDepId);
            }
            break;
          }
          case 'deleteDeployment': {
            // remove deleted dep from available and active deployment filters
            const filteredDeps = state.availFilters.deployments.options.filter(
              (opt) => opt._id !== reqPayload.deploymentId,
            );
            state.availFilters.deployments.options = filteredDeps;

            state.activeFilters.deployments =
              activeDepFilters !== null
                ? activeDepFilters.filter((id) => id !== reqPayload.deploymentId)
                : null;
            break;
          }
          default: {
            const err = 'An operation is required';
            throw new Error(err);
          }
        }
      });
  },
});

export const {
  getModelsSuccess,
  checkboxFilterToggled,
  reviewedFilterToggled,
  customFilterChanged,
  dateFilterChanged,
  setActiveFilters,
  bulkSelectToggled,
  checkboxOnlyButtonClicked,
} = filtersSlice.actions;

// Selectors
export const selectActiveFilters = (state) => state.filters.activeFilters;
export const selectAvailFilters = (state) => state.filters.availFilters;
export const selectAvailCameraFilters = (state) => state.filters.availFilters.cameras;
export const selectAvailDeploymentFilters = (state) => state.filters.availFilters.deployments;
export const selectAvailLabelFilters = (state) => state.filters.availFilters.labels;
export const selectReviewed = (state) => state.filters.activeFilters.reviewed;
export const selectCustomFilter = (state) => state.filters.activeFilters.custom;
export const selectDateAddedFilter = (state) => ({
  start: state.filters.activeFilters.addedStart,
  end: state.filters.activeFilters.addedEnd,
});
export const selectDateCreatedFilter = (state) => ({
  start: state.filters.activeFilters.createdStart,
  end: state.filters.activeFilters.createdEnd,
});

export default filtersSlice.reducer;
