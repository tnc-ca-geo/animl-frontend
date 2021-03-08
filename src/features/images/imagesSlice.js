import { createSlice, createAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';
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
  focusIndex: {
    image: null, 
    object: null,
    label: null,
  },
};

export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {

    clearImages: (state) => { state.images = []; },

    getImagesStart: (state) => { state.pisLoading = true; },

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

    setFocus: (state, { payload }) => {
      state.focusIndex = { ...state.focusIndex, ...payload };
    },

    bboxUpdated: (state, { payload }) => {
      const { imageIndex, objectIndex } = payload;
      const object = state.images[imageIndex].objects[objectIndex];
      object.bbox = payload.bbox;
    },

    objectAdded: (state, { payload }) => {
      const focusedImage = state.images[payload.imageIndex];
      const newObject = {
        bbox: payload.bbox,
        locked: false,
        isBeingAdded: true,
        labels: [],
      };
      focusedImage.objects.unshift(newObject);
    },

    objectRemoved: (state, { payload }) => {
      const focusedImage = state.images[payload.imageIndex];
      focusedImage.objects.splice(payload.objectIndex, 1);
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
      object.isBeingAdded = false;
    },

    labelValidated: (state, { payload }) => {
      const i = payload.index;
      const object = state.images[i.images].objects[i.objects];
      const label = object.labels[i.labels];
      if (payload.validated === true) {
        label.validation = { validated: true };
        object.locked = true;
      }
      else {
        label.validation = { validated: false };
      }
    },

    objectLocked: (state, { payload }) => {
      const i = payload.index;
      const object = state.images[i.images].objects[i.objects];
      object.locked = payload.locked;
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
  setFocus,
  bboxUpdated,
  objectAdded,
  objectRemoved,
  labelAdded,
  labelValidated,
  objectLocked,
} = imagesSlice.actions;

// Actions only used in middlewares:
export const incrementFocusIndex = createAction('loupe/incrementFocusIndex');
export const incrementImage = createAction('loupe/incrementImage');

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => 
  async (dispatch, getState) => {
    try {
      dispatch(getImagesStart());
      if (page !== 'next') {
        dispatch(clearImages());
      }
      const pageInfo = getState().images.present.pageInfo;
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
export const selectPageInfo = state => state.images.present.pageInfo;
export const selectPaginatedField = state => state.images.present.pageInfo.paginatedField;
export const selectSortAscending = state => state.images.present.pageInfo.sortAscending;
export const selectHasPrevious = state => state.images.present.pageInfo.hasPrevious;
export const selectHasNext = state => state.images.present.pageInfo.hasNext;
export const selectImages = state => state.images.present.images;
export const selectImagesCount = state => state.images.present.pageInfo.count;
export const selectIsLoading = state => state.images.present.isLoading;
export const selectVisibleRows = state => state.images.present.visibleRows;
export const selectFocusIndex = state => state.images.present.focusIndex;

export default undoable(imagesSlice.reducer);