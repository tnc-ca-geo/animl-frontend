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
  loadingStates: {
    images: {
      isLoading: false,
      operation: null, /* 'fetching', 'updating', 'deleting' */
      errors: null,
      noneFound: false,
    },
    imageContext: {
      isLoading: false,
      errors: null,
    },
    stats: {
      isLoading: false,
      errors: null,
      noneFound: false,
    }
  },
  imagesStats: null,
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
      state.loadingStates.images = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: false,
      }
    },

    getImagesStart: (state) => { 
      let ls = state.loadingStates.images;
      ls.isLoading = true;
      ls.operation = 'fetching';
      ls.noneFound = false;
    },

    getImagesFailure: (state, { payload }) => {
      let ls = state.loadingStates.images;
      ls.isLoading = false;
      ls.operation = null;
      ls.noneFound = false;
      ls.errors = payload;
    },

    getImagesSuccess: (state, { payload }) => {
      const noneFound = payload.images.pageInfo.count === 0;
      state.loadingStates.images = {
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

    dismissImagesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.image.errors.splice(index, 1);
    },

    preFocusImageStart: (state, { payload }) => {
      state.preFocusImage = payload;
    },

    preFocusImageEnd: (state) => {
      state.preFocusImage = null;
    },

    getImageContextStart: (state) => {
      let ls = state.loadingStates.imageContext;
      ls.isLoading = true;
      // ls.operation = 'fetching';
    },

    getImageContextSuccess: (state) => {
      let ls = state.loadingStates.imageContext;
      ls.isLoading = false;
      // ls.operation = null;
      ls.errors = null;
    },

    getImageContextFailure: (state, { payload }) => {
      console.log('getImageContextFailure: ', payload);
      let ls = state.loadingStates.imageContext;
      ls.isLoading = false;
      // ls.operation = null;
      ls.errors = payload;
    },

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

    dismissImageContextError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.imageContext.errors.splice(index, 1);
    },

    getStatsStart: (state) => {
      let ls = state.loadingStates.stats;
      ls.isLoading = true;
      ls.noneFound = false;
    },

    getStatsSuccess: (state, { payload }) => {
      console.log('getStatsSuccss: ', payload);
      state.imagesStats = payload;
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = payload.stats.imageCount === 0;
      ls.errors = null;
    },

    getStatsFailure: (state, { payload }) => {
      console.log('getStatsFailure: ', payload);
      let ls = state.loadingStates.stats;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

    clearStats: (state) => { 
      state.imagesStats = null; 
      state.loadingStates.stats = {
        isLoading: false,
        errors: null,
        noneFound: false,
      }
    },

    dismissStatsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.stats.errors.splice(index, 1);
    },

  },
});

export const {
  clearImages,
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  dismissImagesError,
  preFocusImageStart,
  preFocusImageEnd,
  getImageContextStart,
  getImageContextSuccess,
  getImageContextFailure,
  sortChanged,
  visibleRowsChanged,
  dismissImageContextError,
  getStatsStart,
  getStatsSuccess,
  getStatsFailure,
  clearStats,
  dismissStatsError,
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

// fetchImageContext thunk - fetch image & determine appropriate filters to
// request it along with temporally adjacent images
export const fetchImageContext = (imgId) => {
  return async (dispatch, getState) => {
    try {

      console.log('fetchImageContext() - imgId: ', imgId);
      dispatch(getImageContextStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {

        let res = await call({
          projId: selectedProj._id,
          request: 'getImage',
          input: { imageId: imgId }
        });

        if (!res.image) {
          throw new Error(`Failed to find image with Id: ${imgId}`);
        }

        // Fetch all images from the image's deployment w/ a createdStart date 
        // 5 mins before dateTimeOriginal of image-to-focus
        const dto = res.image.dateTimeOriginal;
        const startDate = moment(dto, EXIF).subtract(5, 'minutes').format(EXIF);
        const filters = {
          addedEnd: null,
          addedStart: null,
          cameras: null,
          createdEnd: null,
          createdStart: startDate,
          deployments: [res.image.deploymentId],
          labels: null,
          reviewed: null,
          custom: null,
        };
        dispatch(setActiveFilters(filters));
        dispatch(getImageContextSuccess());
      }

    } catch (err) {
      // if we don't find the image and we catch the error thrown above,
      // re-format to match error objects like those returned from the API
      let error = err;
      if (err.message && err.message.includes('Failed to find')) {
        error = [{ message: err.message, extensions: { code: 'NOT_FOUND' }}];
      };
      dispatch(getImageContextFailure(error));
      dispatch(preFocusImageEnd());
      dispatch(push({ search: '' })); // remove URL query string 
    }
  };
};

// fetchStats thunk
export const fetchStats = (filters) => {
  return async (dispatch, getState) => {
    console.log('iamgesSlice - fetchingStats() - filters: ', filters)
    try {

      dispatch(getStatsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'getStats',
          input: { filters },
        });  
        console.log('iamgesSlice - fetchStats() - res: ', res)
        dispatch(getStatsSuccess(res));
      }
    } catch (err) {
      dispatch(getStatsFailure(err));
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
export const selectImagesLoading = state => state.images.loadingStates.images;
export const selectImagesErrors = state => state.images.loadingStates.images.errors;
export const selectVisibleRows = state => state.images.visibleRows;
export const selectPreFocusImage = state => state.images.preFocusImage;
export const selectImageContextLoading = state => state.images.loadingStates.imageContext;
export const selectImageContextErrors = state => state.images.loadingStates.imageContext.errors;
export const selectImagesStats = state => state.images.imagesStats;
export const selectStatsLoading = state => state.images.loadingStates.stats;
export const selectStatsErrors = state => state.images.loadingStates.stats.errors;


// TODO: find a different place for this?
export const selectRouterLocation = state => state.router.location;

export default imagesSlice.reducer;
