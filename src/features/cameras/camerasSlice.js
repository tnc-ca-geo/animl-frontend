import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { enrichCameras } from './utils';

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
      const camIdsInState = state.cameras.map((cam) => cam._id);
      for (const camera of payload) {
        if (!camIdsInState.includes(camera._id)) {
          state.cameras.push(camera);
        }
      }
      if (payload.length === 0) {
        state.noneFound = true;
      }
    },

    editDeploymentsStart: (state) => {
      state.isLoading = true;
    },

    editDeploymentsFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    editDeploymentsSuccess: (state, { payload }) => {
      console.log('edidDeploymentSuccess');
      state.isLoading = false;
      state.error = null;
      const editedCam = payload.camera;
      let camera = state.cameras.find((camera) => camera._id === editedCam._id);
      camera.deployments = editedCam.deployments;
    },

  },
});

// export actions from slice
export const {
  getCamerasStart,
  getCamerasFailure,
  getCamerasSuccess,
  editDeploymentsStart, 
  editDeploymentsFailure,
  editDeploymentsSuccess,
} = camerasSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    console.log('currentUser: ', currentUser)
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if(token){
      dispatch(getCamerasStart());
      const res = await call('getCameras');
      const cameras = enrichCameras(res.cameras);
      dispatch(getCamerasSuccess(cameras));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()));
  }
};

// editDeployments thunk
export const editDeployments = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      if (!operation || !payload) {
        const err = `An operation (create, update, or delete) is required`;
        throw new Error(err);
      }
      dispatch(editDeploymentsStart());
      const res = await call(operation, payload);
      let camera = res[operation].camera;
      camera = enrichCameras([camera])[0];
      dispatch(editDeploymentsSuccess({
        camera,
        operation,
        reqPayload: payload 
      }));
    } catch (err) {
      console.log(`error attempting to ${operation}: ${err.toString()}`);
      dispatch(editDeploymentsFailure(err.toString()));
    }
  };
};

// Selectors
export const selectCameras = state => state.cameras;
export const selectCamerasLoading = state => state.cameras.isLoading;


export default camerasSlice.reducer;
