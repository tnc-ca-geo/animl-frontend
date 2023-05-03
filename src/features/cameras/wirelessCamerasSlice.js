import { createSlice } from '@reduxjs/toolkit';
import { call } from '../../api';
import { Auth } from 'aws-amplify';
import { 
  setSelectedProjAndView,
} from '../projects/projectsSlice';

const initialState = {
  wirelessCameras: [],
  loadingState: {
    isLoading: false,
    operation: null, /* 'fetching', 'updating', 'deleting' */
    errors: null,
    noneFound: false,
  },
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
        noneFound: (payload.length === 0),
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
        noneFound: (payload.wirelessCameras.length === 0),
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
        noneFound: (payload.wirelessCameras.length === 0),
      };
    },

    dismissWirelessCamerasError: (state, { payload }) => {
      const index = payload;
      state.loadingState.errors.splice(index, 1);
    },
    
  },

  extraReducers: (builder) => {
    builder
      .addCase(setSelectedProjAndView, (state, { payload }) => {
        if (payload.newProjSelected) {
          state.wirelessCameras = [];
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
      dispatch(unregisterCameraSuccess(res.unregisterCamera));
    }
  } catch (err) {
    dispatch(unregisterCameraFailure(err));
  }
};


// Selectors
export const selectWirelessCameras = state => state.wirelessCameras.wirelessCameras;
export const selectWirelessCamerasLoading = state => state.wirelessCameras.loadingState;
export const selectWirelessCamerasErrors = state => state.wirelessCameras.loadingState.errors;

export default wirelessCamerasSlice.reducer;
