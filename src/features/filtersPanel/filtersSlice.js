import { createSlice } from '@reduxjs/toolkit';
import { getCameras, getLabels } from '../../api/animlAPI';
import moment from 'moment';
import {
  DATE_FORMAT_EXIF as DFE,
  DATE_FORMAT_READABLE as DFR,
} from '../../config';

const initialState = {
  cameras: {
    cameras: {},
    isLoading: false,
    error: null,
  },
  labels: {
    categories: {},
    isLoading: false,
    error: null,
  },
  dateCreated: {
    start: moment().subtract(3, 'months').format(DFE), 
    end: moment().format(DFE),
  },
  dateAdded: {
    start: moment().subtract(3, 'months').format(DFE), 
    end: moment().format(DFE),
  },
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {

    getCamerasStart: (state) => { state.cameras.isLoading = true; },

    getCamerasFailure: (state, { payload }) => {
      state.cameras.isLoading = false;
      state.cameras.error = payload;
    },

    getCamerasSuccess: (state, { payload }) => {
      state.cameras.isLoading = false;
      state.cameras.error = null;
      payload.cameras.forEach((camera) => {
        if (!(camera._id in state.cameras.cameras)) {
          state.cameras.cameras[camera._id] = { selected: true };
        }
      });
    },

    cameraToggled: (state, { payload }) => {
      const camera = state.cameras.cameras[payload];
      camera.selected = !camera.selected;
    },

    getLabelsStart: (state) => { state.labels.isLoading = true; },

    getLabelsFailure: (state, { payload }) => {
      state.labels.isLoading = false;
      state.labels.error = payload;
    },

    getLabelsSuccess: (state, { payload }) => {
      state.labels.isLoading = false;
      state.labels.error = null;
      payload.labels.categories.forEach((category) => {
        if (!(category in state.labels.categories)) {
          state.labels.categories[category] = { selected: true };
        }
      });
    },

    labelToggled: (state, { payload }) => {
      console.log('label toggled: ', payload);
      const category = state.labels.categories[payload];
      category.selected = !category.selected;
    },

    dateFilterChanged: (state, { payload }) => {
      state[payload.type].start = payload.startDate;
      state[payload.type].end = payload.endDate;
    },

  },
});

export const {
  getCamerasStart,
  getCamerasSuccess,
  getCamerasFailure,
  cameraToggled,
  getLabelsStart,
  getLabelsSuccess,
  getLabelsFailure,
  labelToggled,
  dateFilterChanged,
} = filtersSlice.actions;

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    dispatch(getCamerasStart());
    const cameras = await getCameras();
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

// Selectors
export const selectFilters = state => state.filters;
export const selectCameraFilter = state => state.filters.cameras;
export const selectDateCreatedFilter = state => state.filters.dateCreated;
export const selectDateAddedFilter = state => state.filters.dateAdded;
export const selectLabelFilter = state => state.filters.labels;

export default filtersSlice.reducer;
