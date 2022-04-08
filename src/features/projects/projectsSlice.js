import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth, input } from 'aws-amplify';
import { call } from '../../api';
import { enrichCameras } from './utils';
import {
  registerCameraSuccess,
  unregisterCameraSuccess
} from '../cameras/camerasSlice';

const initialState = {
  projects: [],
  unsavedViewChanges: false,
  /* TODO: figure out better way to structure this? e.g.: */

  // loadingStates: {
  //   projects: {
  //     isLoading: false,
  //     errors: null,
  //   },
  //   views: {
  //     isLoading: false,
  //     errors: null,
  //   },
  //   deployments: {
  //     isLoading: false,
  //     errors: null,
  //   },
  //   cameras: { // this on is a little weird b/c registering a camera might update cameraConfigs but it also affects source cameras
  //     isLoading: false,
  //     errors: null,
  //   },
  //   models: {
  //     isLoading: false,
  //     errors: null,
  //   },
  // },

  // instead of "isLoading[Resource]" state, we might want to be specfic about
  // operation or at least distinguish bettween "isGetting[Resource]" a resource
  // vs "isEditing[Resource]" ?

  isLoadingProjects: false,
  getProjectsErrors: null,

  isEditingViews: false,
  editViewsErrors: null,

  isEditingDeployments: false,
  editDeploymentsErrors: null,

  // isRegisteringCamera: false, 
  // registerCameraErrors: null,

  isLoadingModels: false,
  getModelsErrors: null,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {

    getProjectsStart: (state) => {
      console.log('projectSlice.getProjectsStart()');
      state.isLoadingProjects = true;
    },

    getProjectsFailure: (state, { payload }) => {
      console.log('projectSlice.getProjectsFailure() - payload: ', payload);
      state.isLoadingProjects = false;
      state.getProjectsErrors = payload;
    },

    getProjectsSuccess: (state, { payload }) => {
      console.log('projectSlice.getProjectsSucces() - payload: ', payload);
      state.isLoadingProjects = false;
      state.getProjectsErrors = null;
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

      state.getProjectsErrors = null;
      state.editViewsErrors = null;
      state.registerCameraErrors = null;
      state.getModelsErrors = null;

      // TODO: make sure we're resetting everything else that needs resetting:
      //    - camerasSlice.cameras (done)
      //    - undoHistory (TODO)
      //    - filtersSlice.filters (done)
      
    },

    setUnsavedViewChanges: (state, { payload }) => {
      state.unsavedViewChanges = payload;
    },

    // Views CRUD

    editViewStart: (state) => { 
      state.isEditingViews = true;
    },

    editViewFailure: (state, { payload }) => {
      state.isEditingViews = false;
      state.editViewsErrors = payload;
    },

    // TODO AUTH - come up with a uniform strategy for updateing entities in
    // in the front end afters saving them in DB. Don't do it at all and push 
    // changes to the state at the time we request the opperations?
    // User doesn't have to wait in that case, but if the request fails that 
    // would cause issues....
    // TODO AUTH - instead of passing in projectId to payload, we could also 
    // just search all views in all projects for the project Id
    saveViewSuccess: (state, { payload }) => {
      state.isEditingViews = false;
      state.editViewsErrors = null;
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
      state.isEditingViews = false;
      state.editViewsErrors = null;
      const proj = state.projects.find((p) => p._id === payload.projId);
      proj.views = proj.views.filter((view) => view._id !== payload.viewId);
    },

    /* Deployments CRUD */

    editDeploymentsStart: (state) => {
      state.isEditingDeployments = true;
    },

    editDeploymentsFailure: (state, { payload }) => {
      state.isEditingDeployments = false;
      state.editDeploymentsErrors = payload;
    },

    editDeploymentsSuccess: (state, { payload }) => {
      console.log('projectSlice - editDeploymentSucces() - ', payload);
      state.isEditingDeployments = false;
      state.editDeploymentsErrors = null;
      const editedCam = payload.camera;
      // BUG HERE: if the camera has been registered to multiple projects before, 
      // ALL cameraConfigs on all of those projects will be updated.
      // we only want to update the deployments for the cameraConfig for this
      // cam on the project that was specified 
      for (const proj of state.projects) {
        for (const cam of proj.cameras) {
          if (cam._id === editedCam._id) {
            cam.deployments = editedCam.deployments;
          }
        }
      }

      // TODO AUTH: When we delete a deployment, we should also purge it from 
      // all views that include it in their filters! 
      // that will require updating on the backend too
    },

    /* fetch model source records */

    getModelsStart: (state) => {
      state.isLoadingModels = true;
    },

    getModelsFailure: (state, { payload }) => {
      console.log('projectSlice - getModelsFailure() - ', payload);
      state.isLoadingModels = false;
      state.getModelsFailure = payload;
    },

    getModelsSuccess: (state, { payload }) => {
      console.log('projectSlice - getModelsSucces() - ', payload);
      state.isLoadingModels = false;
      state.getModelsFailure = null;
      const proj = state.projects.find((p) => p._id === payload.projId);
      payload.mlModels.forEach((model) => {
        if (!proj.mlModels) proj.mlModels = [model];
        else if (!proj.mlModels.includes(model._id)) proj.mlModels.push(model);
      });
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(registerCameraSuccess, (state, { payload }) => {
        console.log('projectSlice() - registerCameraSuccess extra reducer: ', payload);
        const proj = state.projects.find((p) => p._id === payload.project._id);
        proj.cameras = payload.project.cameras;
      })
      .addCase(unregisterCameraSuccess, (state, { payload }) => {
        console.log('projectSlice() - unregisterCameraSuccess extra reducer: ', payload);
        // if a project is returned & it's the default_project 
        // update the default_project's cameraConfig array in state
        if (payload.project && payload.project._id === 'default_project') {
          const defaultProj = state.projects.find((p) => (
            p._id === 'default_project'
          ));
          if (!defaultProj) return;
          defaultProj.cameras = payload.project.cameras;
        }
      })

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

  getModelsStart,
  getModelsFailure,
  getModelsSuccess,

} = projectsSlice.actions;


// fetchProjects thunk
export const fetchProjects = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {

      dispatch(getProjectsStart());
      const projects = await call({ request: 'getProjects' });
      dispatch(getProjectsSuccess(projects));

    }
  } catch (err) {
    dispatch(getProjectsFailure(err));
  }
};

// editView thunk
// TODO: maybe break this up into discrete thunks?
// or take the more consolodated approach in editLabels thunk (imagesSlice.js)
export const editView = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;
      if (token && selectedProj) {

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
            dispatch(saveViewSuccess({ projId, view }));
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
      }
    } catch (err) {
      console.log(`error attempting to ${operation} view: `, err);
      dispatch(editViewFailure(err));
    }
  };
};

// editDeployments thunk
export const editDeployments = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      if (token && selectedProj) {

        if (!operation || !payload) {
          const err = `An operation (create, update, or delete) is required`;
          throw new Error(err);
        }
        console.log('projectsSlice - editDeployments() - payload: ', payload)
        dispatch(editDeploymentsStart());
        const res = await call({
          projId: selectedProj._id,
          request: operation,
          input: payload,
        });
        console.log('res: ', res);
        const camera = enrichCameras([res[operation].cameraConfig])[0];
        dispatch(editDeploymentsSuccess({
          camera,
          operation,  // TODO: do we need this? we don't seem to be using it
          reqPayload: payload  // TODO: do we need this? we don't seem to be using it
        }));
      }
    } catch (err) {
      console.log(`error attempting to ${operation}: `, err);
      dispatch(editDeploymentsFailure(err));
    }
  };
};

// fetchModels thunk
export const fetchModels = (payload) => {
  return async (dispatch, getState) => {
    try {

      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        dispatch(getModelsStart());
        const res = await call({
          projId,
          request: 'getModels',
          input: payload,
        });
        dispatch(getModelsSuccess({ projId, mlModels: res.models }));
      }

    } catch (err) {
      dispatch(getModelsFailure(err));
    }
  };
}





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
export const selectMLModels = createSelector([selectSelectedProject],
  (proj) => proj ? proj.mlModels : null
);


export default projectsSlice.reducer;
