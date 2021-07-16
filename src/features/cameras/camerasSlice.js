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
      const camsIdsInState = state.cameras.map((cam) => cam._id);
      for (const camera of payload.cameras) {
        if (!camsIdsInState.includes(camera._id)) {
          state.cameras.push(camera);
        }
      }
      if (payload.cameras.length === 0) {
        state.noneFound = true;
      }
    },
  },
});

// export actions from slice
export const {
  getCamerasStart,
  getCamerasSuccess,
  getCamerasFailure,
} = camerasSlice.actions;

// TODO: maybe use createAsyncThunk for these? 
// https://redux-toolkit.js.org/api/createAsyncThunk

// fetchCameras thunk
export const fetchCameras = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if(token){
      dispatch(getCamerasStart());
      let cameras = await call('getCameras');
      cameras = enrichCameras(cameras);
      dispatch(getCamerasSuccess(cameras));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()));
  }
};

// Selectors
export const selectCameras = state => state.cameras;

export default camerasSlice.reducer;
