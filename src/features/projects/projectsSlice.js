import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { push } from 'connected-react-router';
import { call } from '../../api';
import { registerCameraSuccess, unregisterCameraSuccess } from '../cameras/wirelessCamerasSlice';
import { deleteProjectLabelTaskStart, editDeploymentsSuccess } from '../tasks/tasksSlice';
import { clearImages } from '../images/imagesSlice.js';
import { normalizeErrors } from '../../app/utils.js';

const initialState = {
  // lightweight stubs for every Project the user has access to.
  // shape: { _id, name, description, views: [{ _id, name }] }
  projectStubs: [],
  // full detail for the currently selected Project (or null while loading)
  project: null,
  // full detail for a Project being edited in the superuser EditProjectForm.
  // deliberately kept separate from `project` because a superuser can edit a
  // Project other than the one they currently have open.
  editingProject: null,
  selectedProjectId: null,
  selectedViewId: null,
  // id of the most recently requested Project detail fetch, used to discard
  // responses that have been superseded by a newer selection
  requestedProjectId: null,
  modelOptions: [],
  loadingStates: {
    projectStubs: {
      isLoading: false,
      operation: null /* 'fetching', 'updating', 'deleting' */,
      errors: null,
      noneFound: false,
    },
    project: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    editingProject: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    createProject: {
      isLoading: false,
      operation: null,
      errors: null,
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
    models: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    modelOptions: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    uploads: {
      isLoading: false,
      operation: null,
      errors: null,
      progress: 0,
    },
    projectLabels: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    projectTags: {
      isLoading: false,
      operation: null,
      errors: null,
    },
    updateProject: {
      isLoading: false,
      operation: null,
      errors: null,
    },
  },
  successNotif: {
    title: '',
    message: '',
    durationMs: null,
  },
  unsavedViewChanges: false,
  modalOpen: false,
  modalContent: null,
  selectedCamera: null,
  globalBreakpoint: null,
  automationRules: [],
};

const findDefaultViewId = (views) => views?.find((v) => v.name === 'All images')?._id ?? null;

// derive the lightweight nav-menu representation of a Project from full detail
const toProjectStub = (project) => ({
  _id: project._id,
  name: project.name,
  description: project.description,
  views: (project.views || []).map((v) => ({ _id: v._id, name: v.name })),
});

// keep the nav-menu stub in sync whenever we learn something new about a Project
const syncProjectStub = (state, project) => {
  const idx = state.projectStubs.findIndex((stub) => stub._id === project._id);
  if (idx !== -1) state.projectStubs[idx] = toProjectStub(project);
};

// keep a Project's stub views in sync after a view is created/updated/deleted
const syncProjectStubViews = (state, projId, views) => {
  const stub = state.projectStubs.find((s) => s._id === projId);
  if (stub) stub.views = views.map((v) => ({ _id: v._id, name: v.name }));
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    getProjectStubsStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null, noneFound: false };
      state.loadingStates.projectStubs = ls;
    },

    getProjectStubsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload, noneFound: false };
      state.loadingStates.projectStubs = ls;
    },

    getProjectStubsSuccess: (state, { payload }) => {
      const noneFound = !payload.projects || payload.projects.length === 0;
      state.loadingStates.projectStubs = {
        isLoading: false,
        operation: null,
        errors: null,
        noneFound,
      };
      state.projectStubs = payload.projects || [];
    },

    dismissProjectStubsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.projectStubs.errors.splice(index, 1);
    },

    getProjectStart: (state, { payload }) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.project = ls;
      state.requestedProjectId = payload;
    },

    getProjectFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.project = ls;
    },

    getProjectSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.project = ls;
      state.project = payload.project;
      syncProjectStub(state, payload.project);
    },

    dismissProjectError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.project.errors.splice(index, 1);
    },

    getEditingProjectStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.editingProject = ls;
    },

    getEditingProjectFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.editingProject = ls;
    },

    getEditingProjectSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.editingProject = ls;
      state.editingProject = payload.project;
    },

    clearEditingProject: (state) => {
      state.editingProject = null;
      state.loadingStates.editingProject = { isLoading: false, operation: null, errors: null };
    },

    // dispatched when the user navigates to a different Project, before that
    // Project's detail has been fetched. Other slices listen for this to reset
    // their project-scoped state.
    //
    // NOTE: `project` is deliberately left in place until the incoming Project's
    // detail lands. Clearing the selected ids is enough to make the nav, the
    // images panel and the view-dependent controls go quiet, and it avoids
    // yanking labels/tags/cameraConfigs out from under components that are still
    // mounted while the fetch is in flight.
    projectChanged: (state) => {
      state.selectedProjectId = null;
      state.selectedViewId = null;
      state.unsavedViewChanges = false;
      state.loadingStates.project.errors = null;
      state.loadingStates.models.errors = null;
    },

    setSelectedProjAndView: (state, { payload }) => {
      state.selectedProjectId = payload.projId;
      state.selectedViewId = payload.viewId ?? findDefaultViewId(state.project?.views);
      state.loadingStates.views.errors = null;
    },

    setUnsavedViewChanges: (state, { payload }) => {
      state.unsavedViewChanges = payload;
    },

    createProjectStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.createProject = ls;
    },

    createProjectSuccess: (state, { payload }) => {
      const { project } = payload.createProject;
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.createProject = ls;

      state.projectStubs.push(toProjectStub(project));
      state.successNotif = {
        title: 'Created Project',
        message: 'Project created successfully!',
      };
    },

    createProjectFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.createProject = ls;
    },

    dismissCreateProjectError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.createProject.errors.splice(index, 1);
    },

    updateProjectStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };
      state.loadingStates.updateProject = ls;
    },

    updateProjectSuccess: (state, { payload }) => {
      const { project } = payload.updateProject;
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.updateProject = ls;
      if (state.project?._id === project._id) state.project = project;
      if (state.editingProject?._id === project._id) state.editingProject = project;
      syncProjectStub(state, project);
      state.successNotif = {
        title: 'Updated Project',
        message: 'Project updated successfully!',
      };
    },

    updateProjectFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.updateProject = ls;
    },

    dismissUpdateProjectError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.updateProject.errors.splice(index, 1);
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
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.views = ls;

      if (state.project?._id === payload.projId) {
        const idx = state.project.views.findIndex((v) => v._id === payload.view._id);
        if (idx !== -1) {
          state.project.views[idx] = { ...state.project.views[idx], ...payload.view };
        } else {
          state.project.views.push(payload.view);
        }
        syncProjectStubViews(state, payload.projId, state.project.views);
      }
      state.successNotif = {
        title: 'View Saved',
        message: 'View successfully saved!',
      };
    },

    deleteViewSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.views = ls;

      if (state.project?._id === payload.projId) {
        state.project.views = state.project.views.filter((view) => view._id !== payload.viewId);
        syncProjectStubViews(state, payload.projId, state.project.views);
      }
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
      state.automationRules = payload.automationRules;
      state.successNotif = {
        title: 'Automation Rules Updated',
        message:
          'Automation rule successfully updated! Note: these changes will only affect image processing going forward. ' +
          'Images that are already in your Project will not be re-processed.',
        durationMs: 6000,
      };
    },

    dismissAutomationRulesError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.automationRules.errors.splice(index, 1);
    },

    getAutomationRulesStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.automationRules = ls;
    },

    getAutomationRulesFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.automationRules = ls;
    },

    getAutomationRulesSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.automationRules = ls;
      state.automationRules = payload.automationRules;
    },

    clearAutomationRules: (state) => {
      state.automationRules = [];
    },

    /*
     * fetch model source records
     */

    getModelsStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };
      state.loadingStates.models = ls;
    },

    getModelsFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.models = ls;
    },

    getModelsSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.models = ls;

      if (state.project?._id !== payload.projId) return;
      const proj = state.project;
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

    dismissModelsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.models.errors.splice(index, 1);
    },

    /*
     * Project Labels CRUD
     */

    createProjectLabelStart: (state) => {
      const ls = { isLoading: true, operation: 'creating', errors: null };
      state.loadingStates.projectLabels = ls;
    },

    createProjectLabelSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.projectLabels = ls;
      if (state.project?._id === payload.projId) state.project.labels = payload.labels;
    },

    createProjectLabelFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectLabels = ls;
    },

    updateProjectLabelStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };
      state.loadingStates.projectLabels = ls;
    },

    updateProjectLabelSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.projectLabels = ls;
      if (state.project?._id === payload.projId) state.project.labels = payload.labels;
    },

    updateProjectLabelFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectLabels = ls;
    },

    deleteProjectLabelStart: (state) => {
      const ls = { isLoading: true, operation: 'deleting', errors: null };
      state.loadingStates.projectLabels = ls;
    },

    deleteProjectLabelSuccess: (state) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.projectLabels = ls;
    },

    deleteProjectLabelFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectLabels = ls;
    },

    dismissManageLabelsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.projectLabels.errors.splice(index, 1);
    },

    /*
     * Project Tags CRUD
     */

    createProjectTagStart: (state) => {
      const ls = { isLoading: true, operation: 'creating', errors: null };
      state.loadingStates.projectTags = ls;
    },

    createProjectTagSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.projectTags = ls;

      if (state.project?._id === payload.projId) state.project.tags = payload.tags;
    },

    createProjectTagFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectTags = ls;
    },

    deleteProjectTagStart: (state) => {
      const ls = { isLoading: true, operation: 'deleting', errors: null };
      state.loadingStates.projectTags = ls;
    },

    deleteProjectTagSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.projectTags = ls;

      if (state.project?._id === payload.projId) state.project.tags = payload.tags;
    },

    deleteProjectTagFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectTags = ls;
    },

    updateProjectTagStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };
      state.loadingStates.projectTags = ls;
    },

    updateProjectTagSuccess: (state, { payload }) => {
      const ls = {
        isLoading: false,
        operation: null,
        errors: null,
      };
      state.loadingStates.projectTags = ls;

      if (state.project?._id === payload.projId) state.project.tags = payload.tags;
    },

    updateProjectTagFailure: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.projectTags = ls;
    },

    dismissProjectTagErrors: (state, { payload }) => {
      const index = payload;
      state.loadingStates.projectTags.errors.splice(index, 1);
    },

    dismissProjectSuccessNotif: (state) => {
      state.successNotif = {
        title: '',
        message: '',
      };
    },

    setModalOpen: (state, { payload }) => {
      state.modalOpen = payload;
    },

    setModalContent: (state, { payload }) => {
      state.modalContent = payload;
    },

    setSelectedCamera: (state, { payload }) => {
      state.selectedCamera = payload;
    },

    setGlobalBreakpoint: (state, { payload }) => {
      state.globalBreakpoint = payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerCameraSuccess, (state, { payload }) => {
        if (state.project?._id !== payload.project._id) return;
        state.project.cameraConfigs = payload.project.cameraConfigs;
      })
      .addCase(unregisterCameraSuccess, (state, { payload }) => {
        // if a project is returned & it's the default_project
        // update the default_project's cameraConfig array in state
        if (payload.project && payload.project._id === 'default_project') {
          if (state.project?._id !== 'default_project') return;
          state.project.cameraConfigs = payload.project.cameraConfigs;
        }
      })
      .addCase(editDeploymentsSuccess, (state, { payload }) => {
        const editedCamConfig = payload.cameraConfig;
        if (state.project?._id !== payload.projId) return;
        for (const camConfig of state.project.cameraConfigs) {
          if (camConfig._id === editedCamConfig._id) {
            camConfig.deployments = editedCamConfig.deployments;
          }
        }

        // TODO: When we delete a deployment, we should also purge it from
        // all views that include it in their filters!
        // that will require updating on the backend too
      });
  },
});

export const {
  getProjectStubsStart,
  getProjectStubsFailure,
  getProjectStubsSuccess,
  dismissProjectStubsError,

  getProjectStart,
  getProjectFailure,
  getProjectSuccess,
  dismissProjectError,

  getEditingProjectStart,
  getEditingProjectFailure,
  getEditingProjectSuccess,
  clearEditingProject,

  projectChanged,
  setSelectedProjAndView,
  setUnsavedViewChanges,
  dismissProjectTagErrors,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  dismissCreateProjectError,

  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  dismissUpdateProjectError,

  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,
  dismissViewsError,

  updateAutomationRulesStart,
  updateAutomationRulesSuccess,
  updateAutomationRulesFailure,
  dismissAutomationRulesError,
  getAutomationRulesStart,
  getAutomationRulesFailure,
  getAutomationRulesSuccess,
  clearAutomationRules,

  getModelsStart,
  getModelsFailure,
  getModelsSuccess,
  getModelOptionsStart,
  getModelOptionsFailure,
  getModelOptionsSuccess,
  dismissModelsError,

  createProjectLabelStart,
  createProjectLabelSuccess,
  createProjectLabelFailure,
  updateProjectLabelStart,
  updateProjectLabelSuccess,
  updateProjectLabelFailure,
  deleteProjectLabelStart,
  deleteProjectLabelSuccess,
  deleteProjectLabelFailure,
  dismissManageLabelsError,

  createProjectTagStart,
  createProjectTagFailure,
  createProjectTagSuccess,
  deleteProjectTagStart,
  deleteProjectTagFailure,
  deleteProjectTagSuccess,
  updateProjectTagStart,
  updateProjectTagFailure,
  updateProjectTagSuccess,

  setModalOpen,
  setModalContent,
  setSelectedCamera,
  dismissProjectSuccessNotif,

  setGlobalBreakpoint,
} = projectsSlice.actions;

// fetch lightweight stubs for every Project the user has access to.
// this is what populates the Project nav menu.
export const fetchProjectStubs = () => async (dispatch) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    if (token) {
      dispatch(getProjectStubsStart());
      const projects = await call({ request: 'getProjectStubs' });
      dispatch(getProjectStubsSuccess(projects));
    }
  } catch (err) {
    console.log('err: ', err);
    const errs = normalizeErrors(err, 'GET_PROJECTS_ERROR');
    dispatch(getProjectStubsFailure(errs));
  }
};

// fetch full detail for a single Project
export const fetchProject = (projId) => async (dispatch, getState) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    if (token) {
      dispatch(getProjectStart(projId));
      const res = await call({ request: 'getProject', input: projId });
      // the user may have selected a different Project while this was in
      // flight. bail rather than let a slow response overwrite a newer one -
      // filtersSlice also derives its available filters from getProjectSuccess.
      if (selectRequestedProjectId(getState()) !== projId) return;
      const project = res.projects[0];
      if (!project) throw new Error(`Project ${projId} not found`);
      dispatch(getProjectSuccess({ project }));
    }
  } catch (err) {
    console.log('err: ', err);
    if (selectRequestedProjectId(getState()) !== projId) return;
    const errs = normalizeErrors(err, 'GET_PROJECTS_ERROR');
    dispatch(getProjectFailure(errs));
  }
};

// fetch full detail for an arbitrary Project, for the superuser EditProjectForm.
// kept separate from fetchProject so editing a Project doesn't disturb the one
// the user currently has open.
export const fetchEditingProject = (projId) => async (dispatch) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();

    if (token) {
      dispatch(getEditingProjectStart());
      const res = await call({ request: 'getProject', input: projId });
      const project = res.projects[0];
      if (!project) throw new Error(`Project ${projId} not found`);
      dispatch(getEditingProjectSuccess({ project }));
    }
  } catch (err) {
    console.log('err: ', err);
    const errs = normalizeErrors(err, 'GET_PROJECTS_ERROR');
    dispatch(getEditingProjectFailure(errs));
  }
};

export const createProject = (payload, resetFormCallback) => async (dispatch) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    // TODO make this work
    if (token) {
      dispatch(createProjectStart());
      const project = await call({
        request: 'createProject',
        input: payload,
      });
      dispatch(createProjectSuccess(project));
      resetFormCallback();
    }
  } catch (err) {
    console.log('err: ', err);
    dispatch(createProjectFailure(err));
  }
};

export const updateProject = (projId, diffs, successCallback) => async (dispatch) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token) {
      dispatch(updateProjectStart());
      const result = await call({
        projId,
        request: 'updateProject',
        input: diffs,
      });
      dispatch(updateProjectSuccess(result));
      if (successCallback) successCallback();
    }
  } catch (err) {
    console.log('err: ', err);
    dispatch(updateProjectFailure(err));
  }
};

// editView thunk
// TODO: maybe break this up into discrete thunks?
// or take the more consolodated approach in editLabels thunk (imagesSlice.js)
export const editView = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(editViewStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      // view selection lives in the URL, so navigate rather than dispatching
      // setSelectedProjAndView directly. projectsListeners.js picks the change
      // up and commits it to state.
      const selectView = (viewId) => {
        if (selectSelectedViewId(getState()) !== viewId) {
          dispatch(push(`/app/${projId}/${viewId}`));
        }
      };

      if (token && projId) {
        switch (operation) {
          case 'create': {
            const res = await call({
              projId,
              request: 'createView',
              input: payload,
            });
            const view = res.createView.view;
            dispatch(saveViewSuccess({ projId, view }));
            selectView(view._id);
            break;
          }
          case 'update': {
            const res = await call({
              projId,
              request: 'updateView',
              input: payload,
            });
            const view = res.updateView.view;
            dispatch(saveViewSuccess({ projId, view }));
            selectView(view._id);
            break;
          }
          case 'delete': {
            const res = await call({
              projId,
              request: 'deleteView',
              input: payload,
            });
            const updatedProj = res.deleteView.project;
            const dfltView = updatedProj.views.find((view) => view.name === 'All images');
            // select the default view *before* removing the deleted one, so
            // selectSelectedView never briefly resolves to undefined while
            // DeleteViewForm is still mounted
            selectView(dfltView._id);
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
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'updateAutomationRules',
          input: payload,
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

//fetchAutomationRules thunk
export const fetchAutomationRules = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(getAutomationRulesStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          request: 'getProjectAutomationRules',
          input: { _ids: [projId] },
        });
        const automationRules = res.projects[0].automationRules;
        dispatch(getAutomationRulesSuccess({ projId, automationRules }));
      }
    } catch (err) {
      console.log(`error attempting to fetch automation rules: `, err);
      dispatch(getAutomationRulesFailure(err));
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
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
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
};

export const fetchModelOptions = () => {
  return async (dispatch) => {
    try {
      dispatch(getModelOptionsStart());
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
};

// Project Tags thunks
export const createProjectTag = (payload) => {
  return async (dispatch, getState) => {
    console.log('createProjectTag payload: ', payload);
    try {
      dispatch(createProjectTagStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'createProjectTag',
          input: payload,
        });
        dispatch(createProjectTagSuccess({ projId, tags: res.createProjectTag.tags }));
      }
    } catch (err) {
      console.log(`error attempting to create tag: `, err);
      dispatch(createProjectTagFailure(err));
    }
  };
};

export const deleteProjectTag = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(deleteProjectTagStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'deleteProjectTag',
          input: payload,
        });
        dispatch(deleteProjectTagSuccess({ projId, tags: res.deleteProjectTag.tags }));
        dispatch(clearImages());
        dispatch(fetchProject(projId));
      }
    } catch (err) {
      console.log(`error attempting to delete tag: `, err);
      dispatch(deleteProjectTagFailure(err));
    }
  };
};

export const updateProjectTag = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateProjectTagStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'updateProjectTag',
          input: payload,
        });
        dispatch(updateProjectTagSuccess({ projId, tags: res.updateProjectTag.tags }));
      }
    } catch (err) {
      console.log(`error attempting to update tag: `, err);
      dispatch(updateProjectTagFailure(err));
    }
  };
};

// Project Labels thunks
export const createProjectLabel = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(createProjectLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'createProjectLabel',
          input: payload,
        });
        dispatch(createProjectLabelSuccess({ projId, labels: res.createProjectLabel.labels }));
      }
    } catch (err) {
      console.log(`error attempting to create label: `, err);
      dispatch(createProjectLabelFailure(err));
    }
  };
};

export const updateProjectLabel = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateProjectLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'updateProjectLabel',
          input: payload,
        });
        dispatch(updateProjectLabelSuccess({ projId, labels: res.updateProjectLabel.labels }));
      }
    } catch (err) {
      const errs = normalizeErrors(err, 'UPDATE_PROJECT_LABEL_ERROR');
      dispatch(updateProjectLabelFailure(errs));
    }
  };
};

export const deleteProjectLabel = (payload) => {
  return async (dispatch, getState) => {
    try {
      dispatch(deleteProjectLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projId = selectSelectedProjectId(getState());

      if (token && projId) {
        const res = await call({
          projId,
          request: 'deleteProjectLabel',
          input: { ...payload, processAsTask: false },
        });
        if (res.deleteProjectLabel.movingToTask) {
          // the synchronous label deletion limit has been reached,
          // and an async task was created to complete the deletion.
          // shifting status tracking to task slice
          dispatch(
            deleteProjectLabelTaskStart({
              projId,
              taskId: res.deleteProjectLabel.task._id,
            }),
          );
          dispatch(deleteProjectLabelSuccess({ projId }));
        } else {
          dispatch(deleteProjectLabelSuccess({ projId }));
          dispatch(clearImages());
          dispatch(fetchProject(projId));
        }
      }
    } catch (err) {
      console.log(`error attempting to update label: `, err);
      dispatch(updateProjectLabelFailure(err));
    }
  };
};

// Selectors
export const selectProjectStubs = (state) => state.projects.projectStubs;
export const selectSelectedProject = (state) => state.projects.project;
export const selectSelectedProjectId = (state) => state.projects.selectedProjectId;
export const selectRequestedProjectId = (state) => state.projects.requestedProjectId;
export const selectSelectedViewId = (state) => state.projects.selectedViewId;
export const selectEditingProject = (state) => state.projects.editingProject;
export const selectEditingProjectLoading = (state) => state.projects.loadingStates.editingProject;
export const selectViews = createSelector([selectSelectedProject], (proj) =>
  proj ? proj.views : null,
);
export const selectSelectedView = createSelector(
  [selectViews, selectSelectedViewId],
  (views, viewId) => (views ? views.find((view) => view._id === viewId) : null),
);
export const selectUnsavedViewChanges = (state) => state.projects.unsavedViewChanges;
export const selectMLModels = createSelector([selectSelectedProject], (proj) =>
  proj ? proj.mlModels : null,
);
export const selectProjectLabels = createSelector([selectSelectedProject], (proj) =>
  proj ? proj.labels : [],
);
export const selectCameraConfigs = createSelector([selectSelectedProject], (proj) =>
  proj ? proj.cameraConfigs : [],
);
export const selectProjectTags = createSelector([selectSelectedProject], (proj) =>
  proj ? proj.tags : [],
);
export const selectProjectTagsLoading = (state) =>
  state.projects.loadingStates.projectTags.isLoading;
export const selectProjectStubsLoading = (state) => state.projects.loadingStates.projectStubs;
export const selectProjectLoading = (state) => state.projects.loadingStates.project;
// true while either the Project list or the selected Project's detail is in
// flight - between them they cover the whole "we don't have a Project yet" window
export const selectAnyProjectLoading = createSelector(
  [selectProjectStubsLoading, selectProjectLoading],
  (stubs, project) => stubs.isLoading || project.isLoading,
);
export const selectViewsLoading = (state) => state.projects.loadingStates.views;
export const selectAutomationRulesLoading = (state) => state.projects.loadingStates.automationRules;
export const selectModelsLoadingState = (state) => state.projects.loadingStates.models;
export const selectModalOpen = (state) => state.projects.modalOpen;
export const selectModalContent = (state) => state.projects.modalContent;
export const selectSelectedCamera = (state) => state.projects.selectedCamera;
export const selectGlobalBreakpoint = (state) => state.projects.globalBreakpoint;
export const selectProjectStubsErrors = (state) => state.projects.loadingStates.projectStubs.errors;
export const selectProjectErrors = (state) => state.projects.loadingStates.project.errors;
export const selectViewsErrors = (state) => state.projects.loadingStates.views.errors;
export const selectModelsErrors = (state) => state.projects.loadingStates.models.errors;
export const selectCreateProjectsErrors = (state) =>
  state.projects.loadingStates.createProject.errors;
export const selectCreateProjectLoading = (state) =>
  state.projects.loadingStates.createProject.isLoading;
export const selectModelOptions = (state) => state.projects.modelOptions;
export const selectModelOptionsLoading = (state) =>
  state.projects.loadingStates.modelOptions.isLoading;
export const selectProjectLabelsLoading = (state) => state.projects.loadingStates.projectLabels;
export const selectManageLabelsErrors = (state) =>
  state.projects.loadingStates.projectLabels.errors;
export const selectProjectTagErrors = (state) => state.projects.loadingStates.projectTags.errors;
export const selectAutomationRules = (state) => state.projects.automationRules;
export const selectProjectSuccessNotif = (state) => state.projects.successNotif;
export const selectUpdateProjectLoading = (state) =>
  state.projects.loadingStates.updateProject.isLoading;
export const selectUpdateProjectErrors = (state) =>
  state.projects.loadingStates.updateProject.errors;

export default projectsSlice.reducer;
