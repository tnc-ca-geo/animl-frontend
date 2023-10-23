import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { enrichCameraConfigs } from './utils';
import {
  registerCameraSuccess,
  unregisterCameraSuccess
} from '../cameras/wirelessCamerasSlice';

const initialState = {
  projects: [],
  modelOptions: [],
  loadingStates: {
    projects: {
      isLoading: false,
      operation: null, /* 'fetching', 'updating', 'deleting' */
      errors: null,
      noneFound: false,
    },
    createProject: {
      isLoading: false,
      operation: null,
      errors: null,
      stateMsg: null,
    },
    views: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    automationRules: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    deployments: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    models: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    modelsOptions: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    uploads: {
      isLoading: false,
      operation: null,
      errors: null,
      progress: 0
    }
  },
  unsavedViewChanges: false,
  modalOpen: false,
  modalContent: null,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    /* 
     * Views CRUD 
     */

    getProjectsStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.projects = ls;
    },

    getProjectsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.projects = ls;
    },

    getProjectsSuccess: (state, { payload }) => {
      const noneFound = !payload.projects || payload.projects.length === 0;
      const ls = { isLoading: false, operation: null, errors: null, noneFound };
      state.loadingStates.projects = ls;
      if (noneFound) {
        state.projects = [];
      } else if (state.projects.length) {
        payload.projects.forEach((newProj) => {
          const idx = state.projects.findIndex((oldProj) => oldProj._id === newProj._id);
          if (idx !== -1) state.projects[idx] = newProj;
        });
      } else {
        state.projects = payload.projects;
      }
    },

    dismissProjectsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.projects.errors.splice(index, 1);
    },

    setSelectedProjAndView: (state, { payload }) => {
      let selectedProj = state.projects.find((p) => p.selected);

      if (payload.newProjSelected) {
        state.projects.forEach((p) => {
          p.selected = p._id === payload.projId;
          if (p._id === payload.projId) selectedProj = p;
        });

        state.loadingStates.projects.errors = null;
        state.loadingStates.models.errors = null;
      }

      if (payload.newViewSelected) {
        selectedProj.views.forEach((v) => {
          v.selected = v._id === payload.viewId;
        });
      }
      
      state.loadingStates.views.errors = null;
    },

    setUnsavedViewChanges: (state, { payload }) => {
      state.unsavedViewChanges = payload;
    },

    createProjectStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null, stateMsg: null };
      state.loadingStates.createProject = ls;
    },

    createProjectSuccess: (state, { payload }) => {
      const { project } = payload.createProject;
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
        stateMsg: `Successfully created project ${project.name}`
      };
      state.loadingStates.createProject = ls;

      state.projects = {
        ...state.projects,
        [project._id]: project
      }
    },

    createProjectFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload, stateMsg: null };
      state.loadingStates.createProject = ls;
    },

    dismissCreateProjectError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.createProject.errors.splice(index, 1);
    },

    dismissStateMsg: (state) => {
      const ls = { isLoading: false, operation: null, errors: null, stateMsg: null };
      state.loadingStates.createProject = ls;
    },


    /* 
     * Views CRUD 
     */

    editViewStart: (state) => { 
      const ls = { isLoading: true, operation: 'updating', errors: null };  
      state.loadingStates.views = ls;
    },

    editViewFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.views = ls;
    },

    // TODO AUTH - instead of passing in projectId to payload, we could also 
    // just search all views in all projects for the project Id
    saveViewSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.views = ls;

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
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.views = ls;

      const proj = state.projects.find((p) => p._id === payload.projId);
      proj.views = proj.views.filter((view) => view._id !== payload.viewId);
    },

    dismissViewsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.views.errors.splice(index, 1);
    },

    /* 
     * Automation Rules CRUD 
     */

    updateAutomationRulesStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };  
      state.loadingStates.automationRules = ls;
    },

    updateAutomationRulesFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.automationRules = ls;
    },

    updateAutomationRulesSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.automationRules = ls;
      const editedAutomationRules = payload.automationRules;
      const proj = state.projects.find((p) => p._id === payload.projId);
      proj.automationRules = editedAutomationRules;
    },
    
    dismissAutomationRulesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.automationRules.errors.splice(index, 1);
    },

    /* 
     * Deploployments CRUD 
     */

    editDeploymentsStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };  
      state.loadingStates.deployments = ls;
    },

    editDeploymentsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.deployments = ls;
    },

    editDeploymentsSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.deployments = ls;

      const editedCamConfig = payload.cameraConfig;
      const proj = state.projects.find((p) => p._id === payload.projId);
      for (const camConfig of proj.cameraConfigs) {
        if (camConfig._id === editedCamConfig._id) {
          camConfig.deployments = editedCamConfig.deployments;
        }
      }

      // TODO AUTH: When we delete a deployment, we should also purge it from 
      // all views that include it in their filters! 
      // that will require updating on the backend too
    },
    
    dismissDeploymentsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.deployments.errors.splice(index, 1);
    },

    /* fetch model source records */

    getModelsStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };  
      state.loadingStates.deployments = ls;
    },

    getModelsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.deployments = ls;
    },

    getModelsSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.deployments = ls;

      const proj = state.projects.find((p) => p._id === payload.projId);
      payload.mlModels.forEach((model) => {
        if (!proj.mlModels) proj.mlModels = [model];
        else if (!proj.mlModels.includes(model._id)) proj.mlModels.push(model);
      });
    },

    getModelOptionsStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.modelOptions = ls;
    },

    getModelOptionsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.modelOptions = ls;
    },

    getModelOptionsSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.modelOptions = ls;
      state.modelOptions = payload;
    },

    setModalOpen: (state, { payload }) => {
      state.modalOpen = payload;
    },

    setModalContent: (state, { payload }) => {
      state.modalContent = payload;
    },

    dismissModelsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.models.errors.splice(index, 1);
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(registerCameraSuccess, (state, { payload }) => {
        const proj = state.projects.find((p) => p._id === payload.project._id);
        proj.cameraConfigs = payload.project.cameraConfigs;
      })
      .addCase(unregisterCameraSuccess, (state, { payload }) => {
        // if a project is returned & it's the default_project 
        // update the default_project's cameraConfig array in state
        if (payload.project && payload.project._id === 'default_project') {
          const defaultProj = state.projects.find((p) => (
            p._id === 'default_project'
          ));
          if (!defaultProj) return;
          defaultProj.cameraConfigs = payload.project.cameraConfigs;
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
  dismissProjectsError,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  dismissCreateProjectError,
  dismissStateMsg,

  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,
  dismissViewsError,

  updateAutomationRulesStart,
  updateAutomationRulesSuccess,
  updateAutomationRulesFailure,
  dismissAutomationRulesError,

  editDeploymentsStart, 
  editDeploymentsFailure,
  editDeploymentsSuccess,
  dismissDeploymentsError,

  getModelsStart,
  getModelsFailure,
  getModelsSuccess,
  dismissModelsError,
  getModelOptionsStart,
  getModelOptionsFailure,
  getModelOptionsSuccess,

  setModalOpen,
  setModalContent,

} = projectsSlice.actions;


// fetchProjects thunk
export const fetchProjects = (payload) => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    if (token) {
      dispatch(getProjectsStart());
      const projects = await call({ 
        request: 'getProjects',
        ...(payload && { input: payload })
      });
      dispatch(getProjectsSuccess(projects));
    }
  } catch (err) {
    console.log('err: ', err)
    dispatch(getProjectsFailure(err));
  }
};

export const createProject = (payload) => async dispatch => {
  try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      // TODO make this work
      if (token) {
        dispatch(createProjectStart());
        const project = await call({ 
          request: 'createProject',
          input: payload
        });
        dispatch(createProjectSuccess(project));
      }
  } catch (err) {
    console.log('err: ', err)
    dispatch(createProjectFailure(err));
  }
}

// editView thunk
// TODO: maybe break this up into discrete thunks?
// or take the more consolodated approach in editLabels thunk (imagesSlice.js)
export const editView = (operation, payload) => {
  return async (dispatch, getState) => {
    try {

      dispatch(editViewStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        switch (operation) {
          case 'create': {
            const res = await call({ 
              projId,
              request: 'createView',
              input: payload
            });
            const view = res.createView.view;
            dispatch(saveViewSuccess({ projId, view }));
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
            const dfltView = updatedProj.views.find((view) => (
              view.name === 'All images'
            ));
            dispatch(setSelectedProjAndView({ projId, viewId: dfltView._id })); 
            dispatch(deleteViewSuccess({ projId, viewId: payload.viewId }));
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

// updateAutomationRules thunk
export const updateAutomationRules = (payload) => {
  return async (dispatch, getState) => {
    try {

      dispatch(updateAutomationRulesStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'updateAutomationRules', 
          input: payload
        });
        const automationRules = res.updateAutomationRules.automationRules;
        dispatch(updateAutomationRulesSuccess({ projId, automationRules }));
      }
    } catch (err) {
      console.log(`error attempting to update automation rules: `, err);
      dispatch(updateAutomationRulesFailure(err));
    }
  };
};

// editDeployments thunk
export const editDeployments = (operation, payload) => {
  return async (dispatch, getState) => {
    try {

      dispatch(editDeploymentsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {

        if (!operation || !payload) {
          const err = `An operation (create, update, or delete) is required`;
          throw new Error(err);
        }

        const res = await call({
          projId,
          request: operation,
          input: payload,
        });

        const cameraConfig = enrichCameraConfigs([res[operation].cameraConfig])[0];
        dispatch(editDeploymentsSuccess({
          projId,
          cameraConfig,
          operation,
          reqPayload: payload
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
      
      dispatch(getModelsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'getModels',
          input: payload,
        });
        dispatch(getModelsSuccess({ projId, mlModels: res.mlModels }));
      }

    } catch (err) {
      dispatch(getModelsFailure(err));
    }
  };
}

export const fetchModelOptions = () => {
  return async (dispatch) => {
    try {
      dispatch(getModelsStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

      if (token) {
        const res = await call({
          request: 'getModels',
          input: {},
        });
        dispatch(getModelOptionsSuccess(res.mlModels));
      }

    } catch (err) {
      dispatch(getModelOptionsFailure(err));
    }
  };
}


// Selectors
export const selectProjects = state => state.projects.projects;
export const selectSelectedProject = state => (
  state.projects.projects.find((proj) => proj.selected)
);
export const selectSelectedProjectId = createSelector([selectSelectedProject],
  (proj) => proj ? proj._id : null
);
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
export const selectProjectsLoading = state => state.projects.loadingStates.projects;
export const selectViewsLoading = state => state.projects.loadingStates.views;
export const selectAutomationRulesLoading = state => state.projects.loadingStates.automationRules;
export const selectDeploymentsLoading = state => state.projects.loadingStates.deployments;
export const selectModelsLoadingState = state => state.projects.loadingStates.models;
export const selectModalOpen = state => state.projects.modalOpen;
export const selectModalContent = state => state.projects.modalContent;
export const selectProjectsErrors = state => state.projects.loadingStates.projects.errors;
export const selectViewsErrors = state => state.projects.loadingStates.views.errors;
export const selectDeploymentsErrors = state => state.projects.loadingStates.deployments.errors;
export const selectModelsErrors = state => state.projects.loadingStates.models.errors;
export const selectCreateProjectState = state => state.projects.loadingStates.createProject.stateMsg;
export const selectCreateProjectsErrors = state => state.projects.loadingStates.createProject.errors;
export const selectModelOptions = state => state.projects.modelOptions;

export default projectsSlice.reducer;
