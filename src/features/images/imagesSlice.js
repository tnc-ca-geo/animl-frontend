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
  loadingStates: {
    images: {
      isLoading: false,
      operation: null /* 'fetching', 'updating', 'deleting' */,
      errors: null,
      noneFound: false,
    },
    imagesCount: {
      isLoading: false,
      errors: null,
    },
    imageContext: {
      isLoading: false,
      errors: null,
    },
  },
  preFocusImage: null,
  visibleRows: [],
  deleteImagesAlertOpen: false,
  pageInfo: {
    limit: IMAGE_QUERY_LIMITS[2],
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
    clearImages: (state) => {
      state.loadingStates.images = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: false,
      };
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
      state.loadingStates.images = {
        isLoading: false,
        operation: null,
        errors: null,
      };

      Object.keys(payload.images.pageInfo).forEach((key) => {
        if (key in state.pageInfo && state.pageInfo[key] !== payload.images.pageInfo[key]) {
          state.pageInfo[key] = payload.images.pageInfo[key];
        }
      });
    },

    getImagesCountStart: (state) => {
      state.pageInfo.count = null;
      let ls = state.loadingStates.imagesCount;
      ls.isLoading = true;
      ls.errors = null;
    },

    getImagesCountFailure: (state, { payload }) => {
      let ls = state.loadingStates.imagesCount;
      ls.isLoading = false;
      ls.errors = payload;
    },

    getImagesCountSuccess: (state, { payload }) => {
      state.loadingStates.images.noneFound = payload.imagesCount.count === 0;
      state.loadingStates.imagesCount = {
        isLoading: false,
        errors: null,
      };
      state.pageInfo.count = payload.imagesCount.count;
    },

    dismissImagesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.images.errors.splice(index, 1);
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
      let ls = state.loadingStates.imageContext;
      ls.isLoading = false;
      // ls.operation = null;
      ls.errors = payload;
    },

    sortChanged: (state, { payload }) => {
      if (!payload.length) return;
      const fieldMappings = {
        dtOriginal: 'dateTimeOriginal',
        dtAdded: 'dateAdded',
      };
      const sortAscending = !payload[0].desc;
      let sortField = fieldMappings[payload[0].id] || payload[0].id;
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

    deleteImagesStart: (state) => {
      state.loadingStates.images.isLoading = true;
      state.loadingStates.images.operation = 'deleting';
      state.loadingStates.images.error = null;
      state.deleteImagesAlertOpen = false;
    },

    deleteImagesSuccess: (state) => {
      state.loadingStates.images.isLoading = false;
      state.loadingStates.images.operation = null;
    },

    deleteImagesError: (state, { payload }) => {
      state.loadingStates.images.isLoading = false;
      state.loadingStates.images.errors = payload;
    },

    setDeleteImagesAlertOpen: (state, { payload }) => {
      state.deleteImagesAlertOpen = payload;
    },
  },
});

export const {
  clearImages,
  getImagesStart,
  getImagesSuccess,
  getImagesFailure,
  getImagesCountStart,
  getImagesCountSuccess,
  getImagesCountFailure,
  dismissImagesError,
  preFocusImageStart,
  preFocusImageEnd,
  getImageContextStart,
  getImageContextSuccess,
  getImageContextFailure,
  sortChanged,
  visibleRowsChanged,
  dismissImageContextError,
  deleteImagesStart,
  deleteImagesSuccess,
  deleteImagesError,
  setDeleteImagesAlertOpen,
} = imagesSlice.actions;

// fetchImages thunk
export const fetchImages = (filters, page = 'current') => {
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

// fetchImagesCount thunk
// NOTE: fetching count separately as a temp fix for
// https://github.com/tnc-ca-geo/animl-api/issues/160
export const fetchImagesCount = (filters) => {
  return async (dispatch, getState) => {
    try {
      dispatch(getImagesCountStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        let res = await call({
          projId: selectedProj._id,
          request: 'getImagesCount',
          input: { filters },
        });

        dispatch(getImagesCountSuccess(res));
      }
    } catch (err) {
      if (err.message.includes('Network request failed')) {
        dispatch(getImagesCountFailure(err.message));
      } else {
        dispatch(getImagesCountFailure(err));
      }
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
          input: { imageId: imgId },
        });

        // Fetch all images from the image's deployment within a
        // 5 minute window of the dateTimeOriginal of image-to-focus

        const dto = DateTime.fromISO(res.image.dateTimeOriginal);
        const startDate = dto.minus({ minutes: 2.5 }).toISO();
        const endDate = dto.plus({ minutes: 2.5 }).toISO();
        const filters = {
          addedEnd: null,
          addedStart: null,
          cameras: null,
          createdEnd: endDate,
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
      dispatch(getImageContextFailure(err));
      dispatch(preFocusImageEnd());
      dispatch(push({ search: '' })); // remove URL query string
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
      await call({
        projId: selectedProj._id,
        request: 'deleteImages',
        input: { imageIds },
      });
    }
    dispatch(
      setFocus({
        index: { image: null, object: null, label: null },
        type: 'auto',
      }),
    );
    dispatch(setSelectedImageIndices([]));
    dispatch(deleteImagesSuccess(imageIds));
  } catch (err) {
    console.log(`error attempting to delete image: `, err);
    dispatch(deleteImagesError(err));
  }
};

export const selectPageInfo = (state) => state.images.pageInfo;
export const selectPaginatedField = (state) => state.images.pageInfo.paginatedField;
export const selectSortAscending = (state) => state.images.pageInfo.sortAscending;
export const selectHasPrevious = (state) => state.images.pageInfo.hasPrevious;
export const selectHasNext = (state) => state.images.pageInfo.hasNext;
export const selectImagesCount = (state) => state.images.pageInfo.count;
export const selectImagesCountLoading = (state) => state.images.loadingStates.imagesCount;
export const selectImagesLoading = (state) => state.images.loadingStates.images;
export const selectImagesErrors = (state) => state.images.loadingStates.images.errors;
export const selectVisibleRows = (state) => state.images.visibleRows;
export const selectPreFocusImage = (state) => state.images.preFocusImage;
export const selectImageContextLoading = (state) => state.images.loadingStates.imageContext;
export const selectImageContextErrors = (state) => state.images.loadingStates.imageContext.errors;
export const selectDeleteImagesAlertOpen = (state) => state.images.deleteImagesAlertOpen;

// TODO: find a different place for this?
export const selectRouterLocation = (state) => state.router.location;

export default imagesSlice.reducer;
