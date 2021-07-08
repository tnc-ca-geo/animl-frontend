import { createSlice, createAction } from '@reduxjs/toolkit';
import { ObjectID } from 'bson';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { enrichImages } from './utils';
import { IMAGE_QUERY_LIMITS } from '../../config';

const initialState = {
  images: [],
  isLoading: false,
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

  },
});

export const {
  clearImages,
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  sortChanged,
  visibleRowsChanged,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => 
  async (dispatch, getState) => {
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
