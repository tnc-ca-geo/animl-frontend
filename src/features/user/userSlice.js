import { createSlice, createSelector } from '@reduxjs/toolkit';
import { call } from '../../api';
import { selectSelectedProject } from '../projects/projectsSlice';
import { DEFAULT_DEPLOYMENT_SORT_ORDER } from './constants';

const initialState = {
  // Auth
  username: null,
  groups: [],
  projects: {},
  authStatus: null,
  // User record
  loaded: false,
  updated: null,
  preferences: {
    deploymentsSortOrder: {}, // { [projectId]: 'dateAdded' | 'alphabetical' }
  },
  loadingStates: {
    fetch: { isLoading: false, errors: null },
    update: { isLoading: false, errors: null },
  },
};

const toSortOrderMap = (list) =>
  (list || []).reduce((acc, { projectId, sortOrder }) => {
    acc[projectId] = sortOrder;
    return acc;
  }, {});

const applyPreferences = (state, preferences) => {
  state.preferences.deploymentsSortOrder = toSortOrderMap(preferences?.deploymentsSortOrder);
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userAuthStateChanged: (state, { payload }) => {
      const { authStatus, username, groups } = payload;
      state.authStatus = authStatus;
      state.username = username || null;
      state.groups = groups || null;
      if (groups) {
        state.projects = groups.reduce((projects, group) => {
          const groupComponents = group.split('/');
          if (groupComponents.length !== 3) return projects;
          const project = groupComponents[1];
          const role = groupComponents[2];
          if (!projects[project]) {
            projects[project] = { roles: [role] };
          } else {
            projects[project].roles.push(role);
          }
          return projects;
        }, {});
      } else {
        state.projects = null;
      }
    },

    fetchUserStart: (state) => {
      state.loadingStates.fetch = { isLoading: true, errors: null };
    },
    fetchUserSuccess: (state, { payload }) => {
      state.loadingStates.fetch = { isLoading: false, errors: null };
      state.loaded = true;
      state.updated = payload?.updated ?? null;
      applyPreferences(state, payload?.preferences);
    },
    fetchUserFailure: (state, { payload }) => {
      state.loadingStates.fetch = { isLoading: false, errors: payload };
    },

    // Optimistic local write of a single preference
    setPreferenceLocal: (state, { payload }) => {
      const { name, value } = payload;
      if (name === 'deploymentsSortOrder') {
        state.preferences.deploymentsSortOrder = { ...(value || {}) };
      }
    },

    updatePreferenceStart: (state) => {
      state.loadingStates.update = { isLoading: true, errors: null };
    },
    updatePreferenceSuccess: (state, { payload }) => {
      state.loadingStates.update = { isLoading: false, errors: null };
      applyPreferences(state, payload);
    },
    updatePreferenceFailure: (state, { payload }) => {
      state.loadingStates.update = { isLoading: false, errors: payload.error };
      // Roll back to the previous value
      if (payload.name === 'deploymentsSortOrder' && payload.previous !== undefined) {
        state.preferences.deploymentsSortOrder = { ...(payload.previous || {}) };
      }
    },

    clearUser: () => initialState,
  },
});

export const {
  userAuthStateChanged,
  fetchUserStart,
  fetchUserSuccess,
  fetchUserFailure,
  setPreferenceLocal,
  updatePreferenceStart,
  updatePreferenceSuccess,
  updatePreferenceFailure,
  clearUser,
} = userSlice.actions;

export const fetchUser = () => {
  return async (dispatch) => {
    try {
      dispatch(fetchUserStart());
      const res = await call({ request: 'getUser' });
      dispatch(fetchUserSuccess(res.me));
    } catch (err) {
      dispatch(fetchUserFailure(err));
    }
  };
};

// Generic preference update. Callers pass the full preference `value` (e.g. for
// `deploymentsSortOrder`, the full { [projectId]: sortOrder } map). The reducer
// snapshots the previous value so a failed update can roll back.
export const setPreference = ({ name, value }) => {
  return async (dispatch, getState) => {
    const state = getState();
    let previous;
    if (name === 'deploymentsSortOrder') {
      previous = { ...state.user.preferences.deploymentsSortOrder };
    }

    dispatch(setPreferenceLocal({ name, value }));
    dispatch(updatePreferenceStart());
    try {
      const res = await call({
        request: 'updateUserPreferences',
        input: { name, value },
      });
      dispatch(updatePreferenceSuccess(res.updateUserPreferences));
    } catch (err) {
      dispatch(updatePreferenceFailure({ name, previous, error: err }));
    }
  };
};

export const selectUserAuthStatus = (state) => state.user.authStatus;
export const selectUserGroups = (state) => state.user.groups;
export const selectUserUsername = (state) => state.user.username;
export const selectUserProjects = (state) => state.user.projects;
export const selectUserIsSuperUser = (state) =>
  state.user.groups && state.user.groups.includes('animl_superuser');
export const selectUserHasBetaAccess = (state) => state.user.groups.includes('beta_access');
export const selectUserCurrentRoles = createSelector(
  [selectSelectedProject, selectUserProjects, selectUserIsSuperUser],
  (selectedProject, userProjects, isSuperUser) => {
    let roles = [];
    if (isSuperUser) {
      roles = ['super_user'];
    } else if (selectedProject && userProjects) {
      roles = userProjects[selectedProject._id].roles;
    }
    return roles;
  },
);

export const selectUserPreferences = (state) => state.user.preferences;
export const selectAllDeploymentsSortOrders = (state) =>
  state.user.preferences.deploymentsSortOrder;
export const selectDeploymentsSortOrder = (projectId) => (state) =>
  state.user.preferences.deploymentsSortOrder[projectId] ?? DEFAULT_DEPLOYMENT_SORT_ORDER;

export default userSlice.reducer;
