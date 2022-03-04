import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { setSelectedProjAndView } from '../projects/projectsSlice';

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


// Selectors
export const selectCameras = state => state.cameras.cameras;
export const selectCamerasLoading = state => state.cameras.isLoading;

export default camerasSlice.reducer;
