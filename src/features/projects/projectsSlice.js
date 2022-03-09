import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth, input } from 'aws-amplify';
import { call } from '../../api';
import { enrichCameras } from './utils';

const initialState = {
  projects: [],
  unsavedViewChanges: false,
  isLoading: false,
  noneFound: false,
  error: null,
  // TODO AUTH - probably want to have more specific state props for isLoading, 
  // error, etc depending on what part of the Project we're updating 
  cameraRegistrationError: null,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {

    getProjectsStart: (state) => {
      console.log('projectSlice.getProjectsStart()');
      state.isLoading = true;
    },

    getProjectsFailure: (state, { payload }) => {
      console.log('projectSlice.getProjectsFailure() - payload: ', payload);
      state.isLoading = false;
      state.error = payload;
    },

    getProjectsSuccess: (state, { payload }) => {
      console.log('projectSlice.getProjectsSucces() - payload: ', payload);
      state.isLoading = false;
      state.error = null;
      const projectIdsInState = state.projects.map((proj) => proj._id);
      payload.projects.forEach((proj, i) => {
        if (!projectIdsInState.includes(proj._id)) {
          state.projects.push(proj);
        }
      });
    },

    setSelectedProjAndView: (state, { payload }) => {
      console.log('projectSlice.setSelectedProjAndView() - _id: ', payload);
      let selectedProj = state.projects.find((p) => p.selected);
      if (payload.newProjSelected) {
        state.projects.forEach((p) => {
          p.selected = p._id === payload.projId;
          if (p._id === payload.projId) selectedProj = p;
        });
      }

      if (payload.newViewSelected) {
        selectedProj.views.forEach((v) => {
          v.selected = v._id === payload.viewId;
        });
      }

      state.error = null;
      state.cameraRegistrationError = null;
    },

    setUnsavedViewChanges: (state, { payload }) => {
      state.unsavedViewChanges = payload;
    },

    // Views CRUD

    editViewStart: (state) => { 
      // TODO AUTH - maybe be more specific about what part of projects 
      // is loading (have a state.viewsAreLoading, state.camerasAreLoading)
      // for those updates?
      state.isLoading = true;
    },

    editViewFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    // TODO AUTH - come up with a uniform strategy for updateing entities in
    // in the front end afters saving them in DB. Don't do it at all and push 
    // changes to the state at the time we request the opperations?
    // User doesn't have to wait in that case, but if the request fails that 
    // would cause issues....
    // TODO AUTH - instead of passing in projectId to payload, we could also 
    // just search all views in all projects for the project Id
    saveViewSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      let viewInState = false;
      const proj = state.projects.find((p) => p._id === payload.projId);
      proj.views.forEach((view, i) => {
        if (view._id === payload.view._id) {
          viewInState = true;
          proj.views[i] = { ...proj.views[i], ...payload.view };
        }
      });
      if (!viewInState) {
        proj.views.push(payload.view);
      }
    },

    deleteViewSuccess: (state, { payload }) => {
      console.log('projectSlice - deleteViewSuccess() - ', payload)
      state.isLoading = false;
      state.error = null;
      const proj = state.projects.find((p) => p._id === payload.projId);
      proj.views = proj.views.filter((view) => view._id !== payload.viewId);
    },

    // Deployments CRUD

    editDeploymentsStart: (state) => {
      state.isLoading = true;
    },

    editDeploymentsFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    editDeploymentsSuccess: (state, { payload }) => {
      console.log('projectSlice - editDeploymentSucces() - ', payload);
      state.isLoading = false;
      state.error = null;
      const editedCam = payload.camera;
      for (const proj of state.projects) {
        for (const cam of proj.cameras) {
          if (cam._id === editedCam._id) {
            cam.deployments = editedCam.deployments;
          }
        }
      }

      // TODO: When we delete a deployment, we should also purge it from 
      // all views that include it in their filters!
    },

    // Camera registration 

    registerCameraStart: (state) => {
      state.isLoading = true;
    },

    registerCameraFailure: (state, { payload }) => {
      console.log('projectSlice - registerCameraFailure() - ', payload);
      state.isLoading = false;
      state.cameraRegistrationError = payload;
    },

    registerCameraSuccess: (state, { payload }) => {
      console.log('projectSlice - registerCameraSuccess() - ', payload);
      state.isLoading = false;
      state.cameraRegistrationError = null;
      const proj = state.projects.find((p) => p._id === payload.project._id);
      proj.cameras = payload.project.cameras;
    },

  },
});

export const {

  getProjectsStart,
  getProjectsFailure,
  getProjectsSuccess,
  setSelectedProjAndView,
  setUnsavedViewChanges,

  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,

  editDeploymentsStart, 
  editDeploymentsFailure,
  editDeploymentsSuccess,

  registerCameraStart,
  registerCameraFailure,
  registerCameraSuccess,

} = projectsSlice.actions;


// fetchProjects thunk
export const fetchProjects = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    // const userPoolId = currentUser.pool.userPoolId;
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token){
      dispatch(getProjectsStart());
      const projects = await call({ request: 'getProjects' });
      dispatch(getProjectsSuccess(projects));
    }
  } catch (err) {
    dispatch(getProjectsFailure(err.toString()));
  }
};

// editView thunk
// TODO: maybe break this up into discrete thunks?
// or take the more consolodated approach in editLabels thunk (imagesSlice.js)
export const editView = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;
      dispatch(editViewStart());
      switch (operation) {
        case 'create': {
          const res = await call({ 
            projId,
            request: 'createView',
            input: payload
          });
          const view = res.createView.view;
          dispatch(saveViewSuccess({ projId, view}));
          dispatch(setSelectedProjAndView({ projId, viewId: view._id }));
          break;
        }
        case 'update': {
          const res = await call({
            projId,
            request: 'updateView', 
            input: payload
          });
          const view = res.updateView.view;
          dispatch(saveViewSuccess({ projId, view}));
          dispatch(setSelectedProjAndView({ projId, viewId: view._id }));
          break;
        }
        case 'delete': {
          const res = await call({
            projId,
            request: 'deleteView', 
            input: payload
          });
          const updatedProj = res.deleteView.project;
          const defaultView = updatedProj.views.find((view) => (
            view.name === 'All images'
          ));
          dispatch(setSelectedProjAndView({ projId, viewId: defaultView._id })); 
          dispatch(deleteViewSuccess({ projId, viewId: payload._id }));
          break;
        }
        default: {
          const err = 'An operation (create, update, or delete) is required';
          throw new Error(err);
        }
      }
    } catch (err) {
      console.log(`error attempting to ${operation} view: ${err.toString()}`);
      dispatch(editViewFailure(err.toString()));
    }
  };
};

// editDeployments thunk
export const editDeployments = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      if (!operation || !payload) {
        const err = `An operation (create, update, or delete) is required`;
        throw new Error(err);
      }
      const projects = getState().projects.projects
      const selectedProj = projects.find((proj) => proj.selected);
      dispatch(editDeploymentsStart());
      const res = await call({
        projId: selectedProj._id,
        request: operation,
        input: payload,
      });
      console.log('res: ', res)
      const camera = enrichCameras([res[operation].cameraConfig])[0];
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

// registerCamera thunk
export const registerCamera = (payload) => {
  return async (dispatch, getState) => {
    try {
      const projects = getState().projects.projects
      const selectedProj = projects.find((proj) => proj.selected);
      dispatch(registerCameraStart());
      const res = await call({
        projId: selectedProj._id,
        request: 'registerCamera',
        input: payload,
      });
      console.log('res: ', res)
      res.registerCamera.success 
        ? dispatch(registerCameraSuccess(res.registerCamera))
        : dispatch(registerCameraFailure(res.registerCamera.rejectionInfo.msg));
    } catch (err) {
      console.log(`error attempting to register camera: ${err.toString()}`);
      dispatch(registerCameraFailure(err.toString()));
    }
  };
};



// Selectors
export const selectProjectsLoading = state => state.projects.isLoading;
export const selectProjects = state => state.projects.projects;
export const selectSelectedProject = state => (
  state.projects.projects.find((proj) => proj.selected)
);
// TODO AUTH - decide whether we just derive all this in components from
// selectedProject or provide selectors here
export const selectViews = createSelector([selectSelectedProject],
  (proj) => proj ? proj.views : null
);
export const selectSelectedView = createSelector([selectViews],
  (views) => views ? views.find((view) => view.selected) : null
);
export const selectUnsavedViewChanges = state => 
  state.projects.unsavedViewChanges;
export const selectCameraRegistrationError = state => 
  state.projects.cameraRegistrationError;


export default projectsSlice.reducer;
