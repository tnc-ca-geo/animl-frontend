import { createSlice } from '@reduxjs/toolkit';
import { getImages, getCameras } from '../../api/animlAPI';
import moment from 'moment';
import {
  DATE_FORMAT_EXIF as DFE,
  DATE_FORMAT_READABLE as DFR,
  IMAGE_BUCKET_URL } from '../../config';

const imagesInitialState = {
  filters: {
    cameras: {},
    dateCreated: {
      start: moment().subtract(3, 'months').format(DFE), 
      end: moment().format(DFE),
    },
  },
  images: [],
  isLoading: false,
  error: null
};

function startLoading(state) {
  state.isLoading = true
};

function loadingFailed(state, action) {
  state.isLoading = false
  state.error = action.payload
};

export const imagesSlice = createSlice({
  name: 'images',
  initialState: imagesInitialState,
  reducers: {
    getImagesStart: startLoading,
    getImagesSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      const images = payload.images.map((img) => {
        const thumbUrl = IMAGE_BUCKET_URL + 'thumbnails/' + img.hash +
          '-small.jpg';
        const dateCreated = moment(img.dateTimeOriginal).format(DFR);
        return {
          thumbUrl,
          dateCreated,
          ...img
        }
      })
      state.images = images;
    },
    getImagesFailure: loadingFailed,
    getCamerasStart: startLoading,
    getCamerasSuccess: (state, { payload }) => {
      console.log('Updating state with new available cameras: ', payload);
      state.isLoading = false;
      state.error = null;
      payload.cameras.forEach((camera) => {
        if (!(camera._id in state.filters.cameras)) {
          state.filters.cameras[camera._id] = { selected: false };
        }
      });
    },
    getCamerasFailure: loadingFailed,
    cameraToggled: (state, { payload }) => {
      console.log('Camera toggled: ', payload);
      const camera = state.filters.cameras[payload];
      camera.selected = !camera.selected;
    },
    dateCreatedFilterChanged: (state, { payload }) => {
      console.log('Date Created Filter changed : ', payload);
      state.filters.dateCreated.start = payload.startDate;
      state.filters.dateCreated.end = payload.endDate;
      // const camera = state.filters.cameras[payload];
      // camera.selected = !camera.selected;
    },
  },
});

export const {
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  getCamerasStart,
  getCamerasSuccess,
  getCamerasFailure,
  cameraToggled,
  dateCreatedFilterChanged,
} = imagesSlice.actions;

export const fetchImages = filters => async dispatch => {
  try {
    dispatch(getImagesStart());
    const images = await getImages(filters);
    dispatch(getImagesSuccess(images))
  } catch (err) {
    dispatch(getImagesFailure(err.toString()))
  }
};

export const fetchCameras = () => async dispatch => {
  try {
    dispatch(getCamerasStart());
    const cameras = await getCameras();
    dispatch(getCamerasSuccess(cameras))
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()))
  }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectFilters = state => state.images.filters;
export const selectCameraFilter = state => state.images.filters.cameras;
export const selectDateCreatedFilter = state => state.images.filters.dateCreated;
export const selectImages = state => state.images.images;

export default imagesSlice.reducer;
