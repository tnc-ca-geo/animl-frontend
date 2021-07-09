import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { enrichImages } from './utils';
import { IMAGE_QUERY_LIMITS } from '../../config';


const initialState = {
  images: [],
  isLoading: false,
  isUpdatingObjects: false,
  error: null,
  visibleRows: [], // don't really need this anymore?
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[0],
    paginatedField: 'dateTimeOriginal',
    sortAscending: false,
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

    getImagesStart: (state) => { state.pisLoading = true; },

    getImagesFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getImagesSuccess: (state, { payload }) => {
      console.log('get images success from images slice: ', payload)
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
      console.log('successfully updated objects: ', payload);
      const image = state.images.find(img => img._id === imageId);
      image.objects = newObjects;
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
  updateObjectsStart,
  updateObjectsFailure,
  updateObjectsSuccess,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      if (token) {
        dispatch(getImagesStart());
        if (page !== 'next') {
          dispatch(clearImages());
        }
        const pageInfo = getState().images.pageInfo;
      
        let res = await call('getImages', { filters, pageInfo, page });
        res = enrichImages(res);
        dispatch(getImagesSuccess(res));
      }
    } catch (err) {
      dispatch(getImagesFailure(err.toString()))
    }
  };
};

// updateObjects thunk

// TODO: right now we're taking a brute force approach: if there are any 
// edits detected to an image's objects array, we send the whole array back to
// the API replace the obejcts array that was in the image's DB record with 
// the one the user had edited on the front end. 
// This works but is crude and requires us to request ALL fields from the 
// objects from the DB in the first place: if we forget to request a field and 
// then edit & save the object that field/value will be lost forever. Not great.
// It's risky b/c we need to (1) remember to request all object fields, which 
// makes it hard to maintain and defeats purpose of graphQL, and we also need to 
// (2) keep the object perfectly intact w/ no modification on the front end 
// other than intended edits. 
// We should move to a more granular approach to diffing changes and just 
// requesting that the object's modified fields be updated instead. 

export const updateObjects = (payload) => async dispatch => {
  try {
    const currUser = await Auth.currentAuthenticatedUser();
    const token = currUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(updateObjectsStart());
      let res = await call('updateObjects', payload);
      dispatch(updateObjectsSuccess(res));
    }
  } catch (err) {
    dispatch(updateObjectsFailure(err.toString()))
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
