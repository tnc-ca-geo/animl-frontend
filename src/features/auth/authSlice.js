import { createSlice, createSelector } from '@reduxjs/toolkit';
import { selectSelectedProject } from '../projects/projectsSlice';

const initialState = {
  username: null,
  groups: [],
  projects: {},
  authStatus: null,
};

export const authSlice = createSlice({
  name: 'auth',
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
  },
});

export const { userAuthStateChanged } = authSlice.actions;

// Selectors
export const selectUserAuthStatus = (state) => state.auth.authStatus;
export const selectUserGroups = (state) => state.auth.groups;
export const selectUserUsername = (state) => state.auth.username;
export const selectUserProjects = (state) => state.auth.projects;
export const selectUserIsSuperUser = (state) => state.auth.groups && state.auth.groups.includes('animl_superuser');
export const selectUserHasBetaAccess = (state) => state.auth.groups.includes('beta_access');
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

export default authSlice.reducer;
