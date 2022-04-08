import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { 
  setSelectedProjAndView,
} from '../projects/projectsSlice';

const initialState = {
  cameras: [],
  isLoading: false,
  noneFound: false,
  errors: null,
};

export const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {

    getCamerasStart: (state) => {
      state.isLoading = true;
    },

    getCamerasFailure: (state, { payload }) => {
      state.isLoading = false;
      state.errors = payload;
    },

    getCamerasSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.errors = null;
      state.cameras = payload;
      if (payload.length === 0) {
        state.noneFound = true;
      }
    },

    /* Camera registration */

    registerCameraStart: (state) => {
      state.isLoading = true;
    },

    registerCameraFailure: (state, { payload }) => {
      console.log('cameraSlice - registerCameraFailure() - ', payload);
      state.isLoading = false;
      state.errors = payload;
    },

    registerCameraSuccess: (state, { payload }) => {
      console.log('cameraSlice - registerCameraSuccess() - ', payload);
      state.isLoading = false;
      state.errors = null;
      // TODO: make the cameras update update more surgical?
      state.cameras = payload.cameras;
      if (payload.cameras.length === 0) {
        state.noneFound = true;
      }
    },

    /* Camera unregistration */

    unregisterCameraStart: (state) => {
      state.isLoading = true;
    },

    unregisterCameraFailure: (state, { payload }) => {
      console.log('cameraSlice - unregisterCameraFailure() - ', payload);
      state.isLoading = false;
      state.errors = payload;
    },

    unregisterCameraSuccess: (state, { payload }) => {
      console.log('cameraSlice - unregisterCameraSuccess() - ', payload);
      state.isLoading = false;
      state.errors = null;

      // TODO: make the cameras update update more surgical
      state.cameras = payload.cameras;
      if (payload.cameras.length === 0) {
        state.noneFound = true;
      }
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        if (payload.newProjSelected) {
          state.isLoading = false;
          state.errors = null;
          state.cameras = [];
        }
      })
  },
});

// export actions from slice
export const {

  getCamerasStart,
  getCamerasFailure,
  getCamerasSuccess,

  registerCameraStart,
  registerCameraFailure,
  registerCameraSuccess,

  unregisterCameraStart,
  unregisterCameraFailure,
  unregisterCameraSuccess,

} = camerasSlice.actions;

// fetchCameras thunk
export const fetchCameras = () => async (dispatch, getState) => {
  try {
    console.log('fetchingCameras()')
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      dispatch(getCamerasStart());
      const res = await call({
        projId: selectedProj._id,
        request: 'getCameras',
      });
      console.log('res: ', res);
      dispatch(getCamerasSuccess(res.cameras));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err));
  }
};

// registerCamera thunk
export const registerCamera = (payload) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        dispatch(registerCameraStart());
        const res = await call({
          projId: selectedProj._id,
          request: 'registerCamera',
          input: payload,
        });
        console.log('res: ', res);
        dispatch(registerCameraSuccess(res.registerCamera))
      }

    } catch (err) {
      console.log(`error(s) attempting to register camera: `, err);
      dispatch(registerCameraFailure(err));
    }
  };
};

// unregisger camera thunk
export const unregisterCamera = (payload) => async (dispatch, getState) => {
  try {
    console.log('unregisteringCamera() - ', payload);
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token){
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      dispatch(unregisterCameraStart());
      const res = await call({
        projId: selectedProj._id,
        request: 'unregisterCamera',
        input: payload
      });
      console.log('res: ', res);
      dispatch(unregisterCameraSuccess(res.unregisterCamera));
    }
  } catch (err) {
    dispatch(unregisterCameraFailure(err));
  }
};


// Selectors
export const selectCameras = state => state.cameras.cameras;
export const selectCamerasLoading = state => state.cameras.isLoading;
export const selectRegisterCameraErrors = state => 
  state.projects.registerCameraErrors;

export default camerasSlice.reducer;
