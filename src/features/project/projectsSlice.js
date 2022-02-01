import { createSlice } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
// import { getUsers } from './utils';

const initialState = {
  name: null,
  users: [],
  isLoading: false,
  noneFound: false,
  error: null
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {

    getUsersStart: (state) => {
      state.isLoading = true;
    },

    getUsersFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getUsersSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      console.log('getUsersSuccess: ', payload)
      for (const user of payload) {
        if (!state.users.includes(user._id)) {
          state.users.push(user);
        }
      }
      if (payload.length === 0) {
        state.noneFound = true;
      }
    },

  },
});

export const {
  getUsersStart,
  getUsersFailure,
  getUsersSuccess
} = projectsSlice.actions;

// fetchUsers thunk
export const fetchUsers = () => async dispatch => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const userPoolId = currentUser.pool.userPoolId;
    const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
    if (token){
      dispatch(getUsersStart());
      // TODO: fetch users from Cognito Identity pool 
      // const users = await getUsers(userPoolId);
      // dispatch(getUsersSuccess(users));
    }
  } catch (err) {
    dispatch(getUsersFailure(err.toString()));
  }
};

// Selectors
// export const selectUserAuthState = state => state.user.authState;
// export const selectUserGroups = state => state.user.groups;
// export const selectUserUsername = state => state.user.username;
// export const selectProjectUsers = state => state.projects.users;

export default projectsSlice.reducer;
