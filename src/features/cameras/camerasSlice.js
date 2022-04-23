import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { 
  setSelectedProjAndView,
} from '../projects/projectsSlice';

const initialState = {
  cameras: [],
  loadingState: {
    isLoading: false,
    operation: null, /* 'fetching', 'updating', 'deleting' */
    errors: null,
    noneFound: false,
  },
};

export const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {

    getCamerasStart: (state) => {
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'fetching';
    },

    getCamerasFailure: (state, { payload }) => {
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    getCamerasSuccess: (state, { payload }) => {
      console.log('getCamerasSuccess: ', payload);
      state.cameras = payload;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: (payload.length === 0),
      };
    },

    /* Camera registration */

    registerCameraStart: (state) => {
      state.loadingState.isLoading = true;
      state.loadingState.operation = 'updating';
    },

    registerCameraFailure: (state, { payload }) => {
      console.log('cameraSlice - registerCameraFailure() - ', payload);
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    registerCameraSuccess: (state, { payload }) => {
      console.log('cameraSlice - registerCameraSuccess() - ', payload);
      state.cameras = payload.cameras;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: (payload.cameras.length === 0),
      };
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
      console.log('cameraSlice - unregisterCameraFailure() - ', payload);
      state.loadingState.isLoading = false;
      state.loadingState.operation = null;
      state.loadingState.errors = payload;
    },

    unregisterCameraSuccess: (state, { payload }) => {
      console.log('cameraSlice - unregisterCameraSuccess() - ', payload);
      state.cameras = payload.cameras;
      state.loadingState = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound: (payload.cameras.length === 0),
      };
    },

    dismissCamerasError: (state, { payload }) => {
      const index = payload;
      state.loadingState.errors.splice(index, 1);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        if (payload.newProjSelected) {
          state.cameras = [];
          state.loadingState = {
            isLoading: false,
            operation: null,
            errors: null,
            noneFound: null,
          };
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

  dismissCamerasError,

} = camerasSlice.actions;

// fetchCameras thunk
export const fetchCameras = () => async (dispatch, getState) => {
  try {
    console.log('fetchingCameras()');
    dispatch(getCamerasStart());
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
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
    dispatch(unregisterCameraStart());
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    const projects = getState().projects.projects;
    const selectedProj = projects.find((proj) => proj.selected);

    if (token && selectedProj) {
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
export const selectCamerasLoading = state => state.cameras.loadingState;
export const selectCamerasErrors = state => state.cameras.loadingState.errors;

export default camerasSlice.reducer;
