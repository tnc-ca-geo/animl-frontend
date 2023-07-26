import { createSlice, createSelector } from '@reduxjs/toolkit';
import { selectSelectedProject } from '../projects/projectsSlice';

const initialState = {
  username: null,
  groups: [],
  projects: {},
  authStatus: null,
  sub: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    userAuthStateChanged: (state, { payload }) => {
      const { authStatus, username, groups, sub, isSuperUser } = payload;
      state.authStatus = authStatus;
      state.username = username || null;
      state.groups = groups || null;
      state.sub = sub || null;
      if (groups) {
        state.projects = groups.reduce((projects, group) => {
          const groupComponents = group.split('/');
          if (groupComponents.length !== 3) return projects;
          const project = groupComponents[1];
          const role = groupComponents[2];
          if (!projects[project]) {
            projects[project] = { roles: [role] };
          }
          else {
            projects[project].roles.push(role);
          }
          return projects;
        }, {});
      }
      else {
        state.projects = null;
      }
    },

  },
});

export const {
  userAuthStateChanged,
} = userSlice.actions;

// Selectors
export const selectUserAuthStatus = state => state.user.authStatus;
export const selectUserGroups = state => state.user.groups;
export const selectUserUsername = state => state.user.username;
export const selectUserProjects = state => state.user.projects;
export const selectUserIsSuperUser = state => state.user.groups.includes('animl_superuser');
export const selectUserCurrentRoles = createSelector(
  [selectSelectedProject, selectUserProjects],
  (selectedProject, userProjects) => {
    return (selectedProject && userProjects) 
      ? userProjects[selectedProject._id].roles
      : [];
  }
);


export default userSlice.reducer;
