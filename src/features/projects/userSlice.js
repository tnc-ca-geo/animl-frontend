import { createSlice } from "@reduxjs/toolkit"
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  users: [],
  loadingStates: {
    users: {
      isLoading: false,
      operation: null,
      errors: null,
    }
  }
}

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      const ls = { isLoading: true, operation: 'fetching', errors: null };  
      state.loadingStates.users = ls;
    },

    fetchUsersSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };  
      state.loadingStates.users = ls;
      state.users = payload.users;
    },

    fetchUsersError: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };  
      state.loadingStates.users = ls;
    },
  }
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersError
} = userSlice.actions;

export const fetchUsers = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(fetchUsersStart());
  
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;
  
      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'getUsers',
        });
        dispatch(fetchUsersSuccess({ users: res.users.users }));
      }
    } catch (err) {
      dispatch(fetchUsersError(err));
    }
  }
}

export const selectUsers = state => state.users.users;

export default userSlice.reducer;
