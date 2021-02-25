import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import moment from 'moment';
import {
  DATE_FORMAT_READABLE as DFR,
  IMAGES_URL, 
  IMAGE_QUERY_LIMITS,
} from '../../config';

const initialState = {
  images: [],
  isLoading: false,
  error: null,
  visibleRows: [],
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[0],
    paginatedField: 'dateTimeOriginal',
    sortAscending: false,
    previous: null,
    hasPrevious: null,
    next: null,
    hasNext: null,
    count: null,
  },
};

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {

    clearImages: (state) => { state.images = []; },

    getImagesStart: (state) => { state.isLoading = true; },

    getImagesFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getImagesSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;

      Object.keys(payload.images.pageInfo).forEach((key) => {
        if (key in state.pageInfo &&
            state.pageInfo[key] !== payload.images.pageInfo[key]) {
          state.pageInfo[key] = payload.images.pageInfo[key];
        }
      });

      const images = payload.images.images.map((img) => {
        const url = IMAGES_URL + 'images/' + img.hash + '.jpg';
        const thumbUrl = IMAGES_URL + 'thumbnails/' + img.hash + '-small.jpg';
        img.dateTimeOriginal = moment(img.dateTimeOriginal).format(DFR);
        img.dateAdded = moment(img.dateAdded).format(DFR);
        return { thumbUrl, url, ...img };
      });
      state.images = state.images.concat(images);
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

    visibleRowsChanged: (state, { payload }) => {
      state.visibleRows = payload;
    },

    labelAdded: (state, { payload }) => {
      const i = payload.index;
      const object = state.images[i.images].objects[i.objects];
      const newLabel = {
        category: payload.category,
        bbox: object.bbox,
        validation: { validated: true },
        type: 'manual',
        conf: 1,
      };
      object.labels.unshift(newLabel);
      object.locked = true;
    },

    labelValidated: (state, { payload }) => {
      console.log('vaildating label with payload: ', payload)
      const i = payload.index;
      const object = state.images[i.images].objects[i.objects];
      const label = object.labels[i.labels];
      if (payload.validated === true) {
        // validate
        label.validation = { validated: true };
        // lock
        object.locked = true;
      }
      else {
        // invalidate
        label.validation = { validated: false };;
      }
    },

  },
});

export const {
  clearImages,
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  sortChanged,
  visibleRowsChanged,
  labelAdded,
  labelValidated,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => 
  async (dispatch, getState) => {
    console.log('fetching images');
    try {
      dispatch(getImagesStart());
      if (page !== 'next') {
        dispatch(clearImages());
      }
      const pageInfo = getState().images.pageInfo;
      const images = await call('getImages', {filters, pageInfo, page});
      dispatch(getImagesSuccess(images))
    } catch (err) {
      dispatch(getImagesFailure(err.toString()))
    }
  };

// The functions below are selectors and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectPageInfo = state => state.images.pageInfo;
export const selectPaginatedField = state => state.images.pageInfo.paginatedField;
export const selectSortAscending = state => state.images.pageInfo.sortAscending;
export const selectHasPrevious = state => state.images.pageInfo.hasPrevious;
export const selectHasNext = state => state.images.pageInfo.hasNext;
export const selectImages = state => state.images.images;
export const selectImagesCount = state => state.images.pageInfo.count;
export const selectIsLoading = state => state.images.isLoading;
export const selectVisibleRows = state => state.images.visibleRows;

export default imagesSlice.reducer;
