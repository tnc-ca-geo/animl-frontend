import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { push } from 'connected-react-router';
import { DateTime } from 'luxon';
import { call } from '../../api';
import { enrichImages } from './utils';
import { setActiveFilters } from '../filters/filtersSlice';
import { IMAGE_QUERY_LIMITS } from '../../config';
import { setFocus, setSelectedImageIndices } from '../review/reviewSlice';

const initialState = {
  // images: [], // we aren't using this... consider removing?
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
    },
    export: {
      isLoading: false,
      errors: null,
      noneFound: false,
    },
  },
  imagesStats: null,
  export: null,
  preFocusImage: null,
  visibleRows: [],
  deleteImagesAlertOpen: false,
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[1],
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

    clearImages: (state) => { 
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
    },

    dismissImagesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.images.errors.splice(index, 1);
    },

    preFocusImageStart: (state, { payload }) => {
      console.log('prefocus image start')
      state.preFocusImage = payload;
    },

    preFocusImageEnd: (state) => {
      console.log('prefocus image end')
      state.preFocusImage = null;
    },

    getImageContextStart: (state) => {
      console.log('get image context start')
      let ls = state.loadingStates.imageContext;
      ls.isLoading = true;
      // ls.operation = 'fetching';
    },

    getImageContextSuccess: (state) => {
      console.log('get image context success')
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
      const fieldMappings = {
        'dtOriginal': 'dateTimeOriginal',
        'dtAdded': 'dateAdded'
      };
      const sortAscending = !payload[0].desc;
      let sortField = fieldMappings[payload[0].id] || payload[0].id ;
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

    exportStart: (state) => {
      state.export = null; 
      state.loadingStates.export = {
        isLoading: true,
        errors: null,
        noneFound: false,
      }
    },

    exportSuccess: (state, { payload }) => {
      state.export = {
        ...state.export,
        ...payload
      }
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = payload.meta.imageCount === 0;
      ls.errors = null;
    },

    exportUpdate: (state, { payload }) => {
      state.export = payload;
    },

    exportFailure: (state, { payload }) => {
      state.export = null; 
      let ls = state.loadingStates.export;
      ls.isLoading = false;
      ls.noneFound = false;
      ls.errors = payload;
    },

    clearExport: (state) => { 
      state.export = null; 
      state.loadingStates.export = {
        isLoading: false,
        errors: null,
        noneFound: false,
      }
    },

    dismissExportError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.export.errors.splice(index, 1);
    },

    deleteImagesStart: (state) => {
      state.loadingStates.images.isLoading = true;
      state.loadingStates.images.operation = 'deleting';
      state.loadingStates.images.error = null;
      state.deleteImagesAlertOpen = false;
    },

    deleteImagesSuccess: (state, { payload }) => {
      state.loadingStates.images.isLoading = false;
      state.loadingStates.images.operation = null;
    },

    deleteImagesError: (state, { payload }) => {
      state.loadingStates.images.isLoading = false;
      state.loadingStates.images.errors = payload;
    },

    setDeleteImagesAlertOpen: (state, { payload }) => {
      state.deleteImagesAlertOpen = payload;
    }

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
  exportStart,
  exportSuccess,
  exportUpdate,
  exportFailure,
  clearExport,
  dismissExportError,
  deleteImagesStart,
  deleteImagesSuccess,
  deleteImagesError,
  setDeleteImagesAlertOpen
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current' ) => {
  return async (dispatch, getState) => {
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
      
        const dto = DateTime.fromISO(res.image.dateTimeOriginal);
        const startDate = dto.minus({ minutes: 5 }).toISO();
        const endDate = dto.plus({ minutes: 5 }).toISO();
        const filters = {
          addedEnd: null,
          addedStart: null,
          cameras: null,
          createdEnd: endDate,
          createdStart: startDate,
          deployments: [res.image.deploymentId],
          labels: null,
          reviewed: null,
          notReviewed: null,
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

// export thunk
export const exportData = ({ format, filters }) => {
  return async (dispatch, getState) => {
    try {

      dispatch(exportStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'export',
          input: { format, filters },
        });  
        dispatch(exportUpdate({ documentId: res.export.documentId }));
      }
    } catch (err) {
      dispatch(exportFailure(err));
    }
  };
};

// getExportStatus thunk
export const getExportStatus = (documentId) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const { exportStatus } = await call({
          projId: selectedProj._id,
          request: 'getExportStatus',
          input: { documentId },
        });  
        
        if (exportStatus.status === 'Success') {
          dispatch(exportSuccess(exportStatus));
        } else if (exportStatus.status === 'Error' && exportStatus.error) {
          dispatch(exportFailure(exportStatus.error));
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          dispatch(getExportStatus(documentId));
        }
      }
    } catch (err) {
      dispatch(exportFailure(err));
    }
  };
};

export const deleteImages = (imageIds) => async (dispatch, getState) => {
  dispatch(deleteImagesStart(imageIds));
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    const projects = getState().projects.projects;
    const selectedProj = projects.find((proj) => proj.selected);

    if (token && selectedProj) {
      const r = await call({
        projId: selectedProj._id,
        request: 'deleteImages',
        input: { imageIds },
      });
    }
    dispatch(setFocus({ 
      index: { image: null, object: null, label: null }, 
      type: 'auto' 
    }));
    dispatch(setSelectedImageIndices([]));
    dispatch(deleteImagesSuccess(imageIds));
  } catch (err) {
    console.log(`error attempting to delete image: `, err);
    dispatch(deleteImagesError(err));
  }
}

export const selectPageInfo = state => state.images.pageInfo;
export const selectPaginatedField = state => state.images.pageInfo.paginatedField;
export const selectSortAscending = state => state.images.pageInfo.sortAscending;
export const selectHasPrevious = state => state.images.pageInfo.hasPrevious;
export const selectHasNext = state => state.images.pageInfo.hasNext;
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
export const selectExport = state => state.images.export;
export const selectExportLoading = state => state.images.loadingStates.export;
export const selectExportErrors = state => state.images.loadingStates.export.errors;
export const selectDeleteImagesAlertOpen = state => state.images.deleteImagesAlertOpen;

// TODO: find a different place for this?
export const selectRouterLocation = state => state.router.location;

export default imagesSlice.reducer;
