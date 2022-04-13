import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { push } from 'connected-react-router';
import moment from 'moment';
import { call } from '../../api';
import { enrichImages } from './utils';
import { setActiveFilters } from '../filters/filtersSlice';
import { IMAGE_QUERY_LIMITS } from '../../config';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';

const initialState = {
  images: [], // we aren't using this... consider removing?
  loadingState: {
    isLoading: false,
    operation: null, /* 'fetching', 'updating', 'deleting' */
    errors: null,
    noneFound: false,
  },
  preFocusImage: null,
  visibleRows: [],
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

    clearImages: (state) => { 
      state.images = []; 
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: false,
      }
    },

    getImagesStart: (state) => { 
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'fetching';
    },

    getImagesFailure: (state, { payload }) => {
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    getImagesSuccess: (state, { payload }) => {
      const noneFound = payload.images.pageInfo.count === 0;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound,
      };

      Object.keys(payload.images.pageInfo).forEach((key) => {
        if (key in state.pageInfo &&
            state.pageInfo[key] !== payload.images.pageInfo[key]) {
          state.pageInfo[key] = payload.images.pageInfo[key];
        }
      });
      state.images =  state.images.concat(payload.images.images);
    },

    preFocusImageStart: (state, { payload }) => {
      state.preFocusImage = payload;
    },

    preFocusImageEnd: (state) => { state.preFocusImage = null; },

    sortChanged: (state, { payload }) => {
      if (!payload.length) return;
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
  preFocusImageStart,
  preFocusImageEnd,
  sortChanged,
  visibleRowsChanged,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current' ) => {
  return async (dispatch, getState) => {
    console.log('iamgesSlice - fetchingImages() - filters: ', filters)
    try {

      dispatch(getImagesStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const pageInfo = getState().images.pageInfo;

      if (token && selectedProj) {

        let res = await call({
          projId: selectedProj._id,
          request: 'getImages',
          input: { filters, pageInfo, page },
        });

        res = enrichImages(res, selectedProj.cameraConfigs);
        if (page !== 'next') dispatch(clearImages());
        console.log('iamgesSlice - fetchingImages() - res: ', res)
        dispatch(getImagesSuccess(res));
        
      }
    } catch (err) {
      dispatch(getImagesFailure(err));
    }
  };
};

// fetchImageContext thunk - fetch image along with temporally adjacent images
export const fetchImageContext = (imgId) => {
  return async (dispatch, getState) => {
    try {

      dispatch(getImagesStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        let focusedImg = await call({
          projId: selectedProj._id,
          request: 'getImage',
          input: { imgId }
        });
        // TODO: test this (see TODO in catch block below)
        if (!focusedImg.image) {
          const msg = `Failed to find an image with Id: ${imgId}`;
          throw new Error(msg);
        }

        // Fetch all images from image's camera with a createdStart date of 
        // 5 mins before dateTimeOriginal of image-to-focus
        const dto = focusedImg.image.dateTimeOriginal;
        const startDate = moment(dto, EXIF).subtract(5, 'minutes').format(EXIF);
        const filters = {
          addedEnd: null,
          addedStart: null,
          cameras: [focusedImg.image.cameraId], // TODO: does this still work now that we're more deployment filter oriented?
          createdEnd: null,
          createdStart: startDate,
          deployments: null,
          labels: null,
          reviewed: null,
          custom: null,
        };
        dispatch(setActiveFilters(filters));

      }
    } catch (err) {
      // TODO: if we catch the error thrown above if there isn't a focusedImg.image
      // it won't be an array of error objects like those returned from the API, 
      // so we need to format it to match, e.g [{message: 'Failed to ...'}]
      // before passing it to getImagesFailure()
      dispatch(getImagesFailure(err));
      dispatch(preFocusImageEnd());
      dispatch(push('/')); // remove URL query string 
    }
  };
};

export const selectPageInfo = state => state.images.pageInfo;
export const selectPaginatedField = state => state.images.pageInfo.paginatedField;
export const selectSortAscending = state => state.images.pageInfo.sortAscending;
export const selectHasPrevious = state => state.images.pageInfo.hasPrevious;
export const selectHasNext = state => state.images.pageInfo.hasNext;
export const selectImages = state => state.images.images;
export const selectImagesCount = state => state.images.pageInfo.count;
export const selectImagesLoading = state => state.images.loadingState;
export const selectVisibleRows = state => state.images.visibleRows;
export const selectPreFocusImage = state => state.images.preFocusImage;

// TODO: find a different place for this?
export const selectRouterLocation = state => state.router.location;

export default imagesSlice.reducer;
