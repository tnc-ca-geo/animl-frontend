import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { setSelectedProjAndView } from '../projects/projectsSlice';

const initialState = {
  wirelessCameras: [],
  cameraImageCount: {
    isLoading: false,
    currentCameraId: null,
    count: null,
  },
  loadingState: {
    isLoading: false,
    operation: null /* 'fetching', 'updating', 'deleting' */,
    errors: null,
    noneFound: false,
  },
  successNotifs: [],
  isDeleteCameraAlertOpen: false,
};

export const wirelessCamerasSlice = createSlice({
  name: 'wirelessCameras',
  initialState,
  reducers: {
    getWirelessCamerasStart: (state) => {
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'fetching';
    },

    getWirelessCamerasFailure: (state, { payload }) => {
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    getWirelessCamerasSuccess: (state, { payload }) => {
      state.wirelessCameras = payload;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: payload.length === 0,
      };
    },

    /* Camera registration */

    registerCameraStart: (state) => {
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'updating';
    },

    registerCameraFailure: (state, { payload }) => {
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    registerCameraSuccess: (state, { payload }) => {
      state.wirelessCameras = payload.wirelessCameras;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: payload.wirelessCameras.length === 0,
      };
      state.successNotifs.push({
        title: 'Camera Registered',
        message: 'Camera successfully registered!',
      });
      // TODO: make the cameras update update more surgical?
      // i.e. ONLY return the new/updated Camera source record and merge it
      // into existing cameras (like we do with Views), and only return the
      // new cameraConfig & merge that with Project.cameras array.
      // Advantages: don't have to do getCameras() on backend before returning,
      // less data in payload
    },

    /* Camera unregistration */

    unregisterCameraStart: (state) => {
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'updating';
    },

    unregisterCameraFailure: (state, { payload }) => {
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    unregisterCameraSuccess: (state, { payload }) => {
      state.wirelessCameras = payload.wirelessCameras;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: payload.wirelessCameras.length === 0,
      };
    },

    dismissWirelessCamerasError: (state, { payload }) => {
      const index = payload;
      state.loadingState.errors.splice(index, 1);
    },

    /* Fetch image count for specific camera, so as to not clash with imageCount in imagesSlice */

    cameraImageCountStart: (state, { payload }) => {
      state.cameraImageCount.isLoading = true;
      state.cameraImageCount.currentCameraId = payload.cameraId;
      state.cameraImageCount.count = null;
    },

    cameraImageCountSuccess(state, { payload }) {
      state.cameraImageCount.isLoading = false;
      state.cameraImageCount.count = payload.imagesCount.count;
    },

    clearCameraImageCount(state) {
      state.cameraImageCount.isLoading = false;
      state.cameraImageCount.currentCameraId = null;
      state.cameraImageCount.count = null;
    },

    cameraImageCountError(state) {
      state.cameraImageCount.isLoading = false;
      state.cameraImageCount.currentCameraId = null;
      state.cameraImageCount.count = null;
    },

    setDeleteCameraAlertStatus: (state, { payload }) => {
      state.isDeleteCameraAlertOpen = payload.isOpen;
    },

    dismissCameraSuccessNotif: (state, { index }) => {
      state.successNotifs.splice(index, 1);
    },
  },

  extraReducers: (builder) => {
    builder.addCase(setSelectedProjAndView, (state, { payload }) => {
      if (payload.newProjSelected) {
        state.wirelessCameras = [];
        state.loadingState = {
          isLoading: false,
          operation: null,
          errors: null,
          noneFound: null,
        };
      }
    });
  },
});

// export actions from slice
export const {
  getWirelessCamerasStart,
  getWirelessCamerasFailure,
  getWirelessCamerasSuccess,

  registerCameraStart,
  registerCameraFailure,
  registerCameraSuccess,

  unregisterCameraStart,
  unregisterCameraFailure,
  unregisterCameraSuccess,

  dismissWirelessCamerasError,

  cameraImageCountStart,
  cameraImageCountSuccess,
  clearCameraImageCount,
  cameraImageCountError,

  setDeleteCameraAlertStatus,
} = wirelessCamerasSlice.actions;

// fetchWirelessCameras thunk
export const fetchWirelessCameras = () => async (dispatch, getState) => {
  try {
    dispatch(getWirelessCamerasStart());
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const res = await call({
        projId: selectedProj._id,
        request: 'getWirelessCameras',
      });
      dispatch(getWirelessCamerasSuccess(res.wirelessCameras));
    }
  } catch (err) {
    dispatch(getWirelessCamerasFailure(err));
  }
};

// registerCamera thunk
export const registerCamera = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(registerCameraStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const res = await call({
          projId: selectedProj._id,
          request: 'registerCamera',
          input: payload,
        });
        dispatch(registerCameraSuccess(res.registerCamera));
      }
    } catch (err) {
      console.log(`error(s) attempting to register camera: `, err);
      dispatch(registerCameraFailure(err));
    }
  };
};

// unregister camera thunk
export const unregisterCamera = (payload) => async (dispatch, getState) => {
  try {
    dispatch(unregisterCameraStart());
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    const projects = getState().projects.projects;
    const selectedProj = projects.find((proj) => proj.selected);

    if (token && selectedProj) {
      const res = await call({
        projId: selectedProj._id,
        request: 'unregisterCamera',
        input: payload,
      });
      dispatch(unregisterCameraSuccess(res.unregisterCamera));
    }
  } catch (err) {
    dispatch(unregisterCameraFailure(err));
  }
};

// fetchCameraImageCount thunk
export const fetchCameraImageCount = (payload) => async (dispatch, getState) => {
  try {
    dispatch(cameraImageCountStart(payload));
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    const projects = getState().projects.projects;
    const selectedProj = projects.find((proj) => proj.selected);

    if (token && selectedProj) {
      const res = await call({
        projId: selectedProj._id,
        request: 'getImagesCount',
        input: { filters: { cameras: [payload.cameraId] } },
      });
      dispatch(cameraImageCountSuccess(res));
    }
  } catch (err) {
    console.log(`error(s) attempting to fetch image count for camera ${payload.cameraId}: `, err);
    dispatch(cameraImageCountError(err));
  }
};

// Selectors
export const selectWirelessCameras = (state) => state.wirelessCameras.wirelessCameras;
export const selectWirelessCamerasLoading = (state) => state.wirelessCameras.loadingState;
export const selectWirelessCamerasErrors = (state) => state.wirelessCameras.loadingState.errors;
export const selectCameraImageCount = (state) => state.wirelessCameras.cameraImageCount.count;
export const selectCameraImageCountLoading = (state) =>
  state.wirelessCameras.cameraImageCount.isLoading;
export const selectDeleteCameraAlertStatus = (state) =>
  state.wirelessCameras.isDeleteCameraAlertOpen;
export const selectCameraSuccessNotifs = (state) => state.wirelessCameras.successNotifs;

export default wirelessCamerasSlice.reducer;
