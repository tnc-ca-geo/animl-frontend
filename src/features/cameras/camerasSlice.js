import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';

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
      console.log('getCamerasSuccess: ', payload);

      // state.availFilters.deployments.isLoading = false;  // maybe don't need
      // state.availFilters.deployments.error = null;  // maybe don't need
      // const depsInState = state.availFilters.deployments.ids;
      // const newDeployments = payload.cameras.reduce((acc, camera) => {
      //   for (const dep of camera.deployments) {
      //     acc.push(dep);
      //   }
      //   return acc;
      // },[]);
      // console.log('newDeployments: ', newDeployments);
      
      // for (const dep of newDeployments) {
      //   if (!depsInState.includes(dep._id)) {
      //     state.availFilters.deployments.ids.push(dep._id);
      //   }
      // }

      state.isLoading = false;
      state.error = null;
      const camsIdsInState = state.cameras.map((cam) => cam._id);
      for (const camera in payload.cameras) {
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
      const cameras = await call('getCameras');
      dispatch(getCamerasSuccess(cameras));
    }
  } catch (err) {
    dispatch(getCamerasFailure(err.toString()));
  }
};

// Selectors
// export const selectActiveFilters = state => state.filters.activeFilters;
// export const selectAvailCameras = state => state.filters.availFilters.cameras;
// export const selectAvailLabels = state => state.filters.availFilters.labels;
// export const selectReviewed = state => state.filters.activeFilters.reviewed;
// export const selectDateAddedFilter = state => ({
//   start: state.filters.activeFilters.addedStart,
//   end: state.filters.activeFilters.addedEnd,
// });
// export const selectDateCreatedFilter = state => ({
//   start: state.filters.activeFilters.createdStart,
//   end: state.filters.activeFilters.createdEnd,
// });
// export const selectFiltersReady = createSelector(
//   [selectAvailCameras, selectAvailLabels],
//   (cameras, labels) => {
//     let ready = true;
//     const fetchedFilters = [cameras, labels];
//     fetchedFilters.forEach(filter => {
//       if (filter.isLoading || filter.error) {
//         ready = false;
//       };
//     })
//     return ready;
//   }
// );

export default camerasSlice.reducer;
