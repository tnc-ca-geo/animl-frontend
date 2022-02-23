import { createSlice, createSelector } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  // name: null,
  projects: [],
  // users: [],
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
        proj.selected = proj._id === payload;
      });
    },

    setSelectedView: (state, { payload }) => {
      console.log('projectSlice.setSelectedView() - _id: ', payload);
      const selectedProj = state.projects.find((proj) => proj.selected);
      if (selectedProj) {
        selectedProj.views.forEach((view) => {
          view.selected = view._id === payload;
        });
      }
    },
      
    // getProjectUsersStart: (state) => {
    //   state.isLoading = true;
    // },

    // getProjectUsersFailure: (state, { payload }) => {
    //   state.isLoading = false;
    //   state.error = payload;
    // },

    // getProjectUsersSuccess: (state, { payload }) => {
    //   state.isLoading = false;
    //   state.error = null;
    //   console.log('getUsersSuccess: ', payload)
    //   for (const user of payload) {
    //     if (!state.users.includes(user._id)) {
    //       state.users.push(user);
    //     }
    //   }
    //   if (payload.length === 0) {
    //     state.noneFound = true;
    //   }
    // },

  },
});

export const {
  getProjectsStart,
  getProjectsFailure,
  getProjectsSuccess,
  setSelectedProject,
  setSelectedView,
  // getProjectUsersStart,
  // getProjectUsersFailure,
  // getProjectUsersSuccess
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

// // fetchProjectUsers thunk
// export const fetchProjectUsers = () => async dispatch => {
//   try {
//     const currentUser = await Auth.currentAuthenticatedUser();
//     const userPoolId = currentUser.pool.userPoolId;
//     const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
//     if (token){
//       dispatch(getUsersStart());
//       // TODO: fetch users from Cognito Identity pool 
//       // const users = await getUsers(userPoolId);
//       // dispatch(getUsersSuccess(users));
//     }
//   } catch (err) {
//     dispatch(getUsersFailure(err.toString()));
//   }
// };

// Selectors
// export const selectUserAuthState = state => state.user.authState;
// export const selectUserGroups = state => state.user.groups;
// export const selectUserUsername = state => state.user.username;
// export const selectProjectUsers = state => state.projects.users;
export const selectProjectsLoading = state => state.projects.isLoading;
export const selectProjects = state => state.projects.projects;
export const selectSelectedProject = state => (
  state.projects.projects.find((proj) => proj.selected)
);
// TODO AUTH - decide whether we just derive all this in components from
// selectedProject or use selectors here
export const selectViews = createSelector([selectSelectedProject],
  (proj) => proj ? proj.views : null
);
export const selectSelectedView = createSelector([selectViews],
  (views) => views ? views.find((view) => view.selected) : null
);

export default projectsSlice.reducer;
