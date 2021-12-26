import { createSlice, createAction } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { push } from 'connected-react-router';
import moment from 'moment';
import { call } from '../../api';
import { enrichImages } from './utils';
import { setActiveFilters } from '../filters/filtersSlice';
import { IMAGE_QUERY_LIMITS } from '../../config';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';

const initialState = {
  images: [],
  isLoading: false,
  isUpdatingObjects: false,
  isEditingLabel: false,
  preFocusImage: null,
  error: null,
  visibleRows: [], // don't really need this anymore?
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[1],
    paginatedField: 'dateTimeOriginal',
    sortAscending: true,
    previous: null,
    hasPrevious: null,
    next: null,
    hasNext: null,
    count: null,
  }
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

      state.images = state.images.concat(payload.images.images);
    },

    preFocusImageStart: (state, { payload }) => {
      state.preFocusImage = payload;
    },

    preFocusImageEnd: (state) => { state.preFocusImage = null; },

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

    updateObjectsStart: (state) => { state.isUpdatingObjects = true; },

    updateObjectsFailure: (state, { payload }) => {
      state.isUpdatingObjects = false;
      state.error = payload;
    },

    updateObjectsSuccess: (state, { payload }) => {
      state.isUpdatingObjects = false;
      state.error = null;
      const imageId = payload.updateObjects.image._id;
      const newObjects = payload.updateObjects.image.objects;
      const image = state.images.find(img => img._id === imageId);
      image.objects = newObjects;
    },

    editLabelStart: (state) => { state.isEditingLabel = true; },

    editLabelFailure: (state, { payload }) => {
      state.isEditingLabel = false;
      state.error = payload;
    },

    editLabelSuccess: (state, { payload }) => {
      console.log('editLabelSuccess: ', payload);
      state.isEditingLabel = false;
      state.error = null;
      const image = state.images.find(img => img._id === payload._id);
      image.objects = payload.objects;
    },

  },
});

export const {
  clearImages,
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  preFocusImageStart,
  preFocusImageEnd,
  sortChanged,
  visibleRowsChanged,
  updateObjectsStart,
  updateObjectsFailure,
  updateObjectsSuccess,
  editLabelStart,
  editLabelFailure,
  editLabelSuccess,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      if (token) {
        dispatch(getImagesStart());
        const pageInfo = getState().images.pageInfo;
        let res = await call('getImages', { filters, pageInfo, page });
        const cameras = getState().cameras.cameras;
        res = enrichImages(res, cameras);
        if (page !== 'next') {
          dispatch(clearImages());
        }
        dispatch(getImagesSuccess(res));
      }
    } catch (err) {
      dispatch(getImagesFailure(err.toString()))
    }
  };
};

// editLabel thunk
export const editLabel = (operation, entity, payload) => {
  return async (dispatch, getState) => {
    try {
      if (!operation || !entity || !payload) {
        const err = `An operation (create, update, or delete) 
          and entity are required`;
        throw new Error(err);
      }
      dispatch(editLabelStart());
      console.group('editLabel()');
      console.log(`${operation} ${entity}`);
      console.log(`payload: `, payload);
      console.groupEnd();
      // TODO: do we really need to pass in the operation and entity separately?
      // why not just do one string, e.g.: 'createObject'
      const req = operation + entity.charAt(0).toUpperCase() + entity.slice(1);
      const res = await call(req, payload);
      const mutation = Object.keys(res)[0];
      const image = res[mutation].image;
      dispatch(editLabelSuccess(image));

    } catch (err) {
      console.log(`error attempting to ${operation} ${entity}: ${err.toString()}`);
      dispatch(editLabelFailure(err.toString()));
    }
  };
};

// fetchImageContext thunk - retrun an image along with adjacent images
export const fetchImageContext = (imgId) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      if (token) {

        dispatch(getImagesStart());        
        let focusedImg = await call('getImage', { imgId });
        if (!focusedImg.image) {
          const err = `Failed to find an image with Id: ${imgId}`;
          throw new Error(err);
        }

        // Fetch all images from image's camera with a createdStart date of 
        // 5 mins before dateTimeOriginal of image-to-focus
        const dto = focusedImg.image.dateTimeOriginal;
        const startDate = moment(dto, EXIF).subtract(5, 'minutes').format(EXIF);
        const filters = {
          addedEnd: null,
          addedStart: null,
          cameras: [focusedImg.image.cameraSn], // TODO: does this still work now that we're more deployment filter oriented?
          createdEnd: null,
          createdStart: startDate,
          deployments: null,
          labels: null,
          reviewed: null
        };
        dispatch(setActiveFilters(filters));
      }
    } catch (err) {
      dispatch(getImagesFailure(err.toString()));
      dispatch(preFocusImageEnd());
      dispatch(push('/')); // remove URL query string 
    }
  };
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
export const selectPreFocusImage= state => state.images.preFocusImage;

// TODO: find a different place for this?
export const selectRouterLocation = state => state.router.location;

export default imagesSlice.reducer;
