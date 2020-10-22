import { createSlice } from '@reduxjs/toolkit';
import { getImages, getCameras } from '../../api/animlAPI';
import moment from 'moment';
import {
  DATE_FORMAT_EXIF as DFE,
  DATE_FORMAT_READABLE as DFR,
  IMAGES_URL, 
  IMAGE_QUERY_LIMITS,
} from '../../config';

const imagesInitialState = {
  filters: {
    cameras: {},
    dateCreated: {
      start: moment().subtract(3, 'months').format(DFE), 
      end: moment().format(DFE),
    },
  },
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[0],
    paginatedField: 'dateTimeOriginal',
    sortAscending: false,
    previous: null,
    hasPrevious: null,
    next: null,
    hasNext: null,
  },
  detailsModal: {
    open: false,
    imageIndex: null,
  },
  images: [],
  isLoading: false,
  error: null,
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

      const pageInfo = payload.images.pageInfo;
      state.pageInfo.previous = pageInfo.previous;
      state.pageInfo.hasPrevious = pageInfo.hasPrevious;
      state.pageInfo.next = pageInfo.next;
      state.pageInfo.hasNext = pageInfo.hasNext;

      const images = payload.images.images.map((img) => {
        const url = IMAGES_URL + 'images/' + img.hash + '.jpg';
        const thumbUrl = IMAGES_URL + 'thumbnails/' + img.hash + '-small.jpg';
        img.dateTimeOriginal = moment(img.dateTimeOriginal).format(DFR);
        return {
          thumbUrl,
          url,
          ...img
        }
      })
      state.images = images;
    },
    getImagesFailure: loadingFailed,
    getCamerasStart: startLoading,
    getCamerasSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      payload.cameras.forEach((camera) => {
        if (!(camera._id in state.filters.cameras)) {
          state.filters.cameras[camera._id] = { selected: true };
        }
      });
    },
    getCamerasFailure: loadingFailed,
    cameraToggled: (state, { payload }) => {
      const camera = state.filters.cameras[payload];
      camera.selected = !camera.selected;
    },
    dateCreatedFilterChanged: (state, { payload }) => {
      state.filters.dateCreated.start = payload.startDate;
      state.filters.dateCreated.end = payload.endDate;
    },
    sortChanged: (state, { payload }) => {
      if (!payload.length) {
        return;
      }
      const sortAscending = !payload[0].desc;
      const sortField = payload[0].id;
      
      if (state.pageInfo.paginatedField !== sortField) {
        state.pageInfo.paginatedField = sortField;
      }
      if (state.pageInfo.sortAscending !== sortAscending) {
        state.pageInfo.sortAscending = sortAscending;
      }
    },
    pageInfoChanged: (state, { payload }) => {
      Object.keys(payload).forEach((key) => {
        if (key in state.pageInfo) {
          state.pageInfo[key] = payload[key];
        }
      });
    },
    imageSelected: (state, { payload }) => {
      state.detailsModal.open = true;
      state.detailsModal.imageIndex = Number(payload);
    },
    detailsModalClosed: (state) => {
      state.detailsModal.open = false;
      state.detailsModal.imageIndex = null;
    },
    incrementImageIndex: (state, { decrement }) => {
      console.log('increment image index fired. Decrement? : ', decrement);
      if (decrement && state.detailsModal.imageIndex > 0) {
        state.detailsModal.imageIndex--
      }
      else {
        state.detailsModal.imageIndex++
      }
    }
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
  sortChanged,
  pageInfoChanged,
  imageSelected,
  detailsModalClosed,
  incrementImageIndex,
} = imagesSlice.actions;

// Thunks
export const fetchImages = (filters, page = 'current') => 
  async (dispatch, getState) => {
    try {
      dispatch(getImagesStart());
      const pageInfo = getState().images.pageInfo;
      const images = await getImages(filters, pageInfo, page);
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

export const selectPageInfo = state => state.images.pageInfo;
export const selectLimit = state => state.images.pageInfo.limit;
export const selectPaginatedField = state => state.images.pageInfo.paginatedField;
export const selectSortAscending = state => state.images.pageInfo.sortAscending;
export const selectHasPrevious = state => state.images.pageInfo.hasPrevious;
export const selectHasNext = state => state.images.pageInfo.hasNext;

export const selectDetailsOpen = state => state.images.detailsModal.open;
export const selectDetailsIndex = state => state.images.detailsModal.imageIndex;

export const selectImages = state => state.images.images;

export default imagesSlice.reducer;
