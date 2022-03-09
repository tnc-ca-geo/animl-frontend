import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { 
  setSelectedProjAndView,
  registerCameraSuccess
} from '../projects/projectsSlice';

const initialState = {
  cameras: [],
  isLoading: false,
  noneFound: false,
  error: null,
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
      state.error = payload;
    },

    getCamerasSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      state.cameras = payload;
      if (payload.length === 0) {
        state.noneFound = true;
      }
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        if (payload.newProjSelected) {
          state.isLoading = false;
          state.error = null;
          state.cameras = [];
        }
      })
      .addCase(registerCameraSuccess, (state, { payload }) => {
        console.log('cameraSlice() - registerCameraSuccess extra reducer: ', payload)
        state.isLoading = false;
        state.error = null;
        state.cameras = payload.cameras;
        if (payload.cameras.length === 0) {
          state.noneFound = true;
        }
      })
  },
});

// export actions from slice
export const {
  getCamerasStart,
  getCamerasFailure,
  getCamerasSuccess,
} = camerasSlice.actions;

// fetchCameras thunk
export const fetchCameras = () => async (dispatch, getState) => {
  try {
    console.log('fetchingCameras()')
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token){
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
    dispatch(getCamerasFailure(err.toString()));
  }
};

// unregisger camera thunk
export const unregisterCamera = (payload) => async (dispatch, getState) => {
  try {
    console.log('unregisteringCamera() - ', payload)
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token){
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      dispatch(getCamerasStart());
      const res = await call({
        projId: selectedProj._id,
        request: 'unregisterCamera',
        input: payload
      });
      console.log('res: ', res);
      res.unregisterCamera.success 
        ? dispatch(getCamerasSuccess(res.unregisterCamera.cameras))
        : dispatch(getCamerasFailure(res.registerCamera.rejectionInfo.msg));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()));
  }
};


// Selectors
export const selectCameras = state => state.cameras.cameras;
export const selectCamerasLoading = state => state.cameras.isLoading;

export default camerasSlice.reducer;
