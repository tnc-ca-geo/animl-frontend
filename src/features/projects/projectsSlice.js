import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth, input } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  projects: [],
  unsavedViewChanges: false,
  isLoading: false,
  noneFound: false,
  error: null
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
      const selectedProj = state.projects.find((proj) => proj.selected);
      payload.projects.forEach((proj, i) => {
        if (!projectIdsInState.includes(proj._id)) {
          // TODO AUTH - how to decide which project is selected by default?
          // If no currently selected project, choose first one? 
          proj.selected = !selectedProj && i === 0;
          proj.views.forEach((view) => {
              view.selected = view.name === 'All images';
          });
          state.projects.push(proj);
        }
      });
    },

    setSelectedProject: (state, { payload }) => {
      console.log('projectSlice.setSelectedProject() - _id: ', payload);
      state.projects.forEach((proj) => {
        proj.selected = proj._id === payload.projId;
      });
    },

    setSelectedView: (state, { payload }) => {
      console.log('projectSlice.setSelectedView() - _id: ', payload.viewId);
      // TODO AUTH - maybe set selected view and set selected project should 
      // be one action? so we don't run the risk of trying to set the selected
      // view on an un-selected project (coudld happen if a user saves/edits a view
      // in one project then toggles to another before it returns).
      const selectedProj = state.projects.find((proj) => proj.selected);
      if (selectedProj) {
        selectedProj.views.forEach((view) => {
          view.selected = view._id === payload.viewId;
        });
      }
    },

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

    setUnsavedViewChanges: (state, { payload }) => {
      state.unsavedViewChanges = payload;
    },

  },
});

export const {
  getProjectsStart,
  getProjectsFailure,
  getProjectsSuccess,
  setSelectedProject,
  setSelectedView,
  editViewStart,
  saveViewSuccess,
  deleteViewSuccess,
  editViewFailure,
  setUnsavedViewChanges,
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
          dispatch(setSelectedView({ viewId: view._id }));
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
          dispatch(setSelectedView({ viewId: view._id }));
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
          dispatch(setSelectedView({ viewId: defaultView._id })); 
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
export const selectUnsavedViewChanges = state => state.projects.unsavedViewChanges;


export default projectsSlice.reducer;
