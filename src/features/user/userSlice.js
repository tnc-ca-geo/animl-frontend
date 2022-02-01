import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  groups: [],
  projects: {},
  authState: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    userAuthStateChanged: (state, { payload }) => {
      state.authState = payload.nextAuthState;
      state.username = payload.username || null;
      state.groups = payload.groups || null;
      if (payload.groups) {
        state.projects = payload.groups.reduce((projects, group, i) => {
          const groupComponents = group.split('/');
          if (groupComponents.length !== 3) return projects;
          const project = groupComponents[1];
          const role = groupComponents[2];
          if (!projects[project]) {
            projects[project] = { roles: [role], selected: i === 0 };
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
export const selectUserAuthState = state => state.user.authState;
export const selectUserGroups = state => state.user.groups;
export const selectUserUsername = state => state.user.username;

export default userSlice.reducer;
