import { createSlice } from "@reduxjs/toolkit"
import { Auth } from 'aws-amplify';
import { call } from '../../api';

const initialState = {
  users: [],
  mode: 'list',
  selectedUser: null,
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

    editUser: (state, { payload }) => {
      state.selectedUser = payload;
      state.mode = 'editUser';
    },

    updateUserStart: (state) => {
      const ls = { isLoading: true, operation: 'updating', errors: null };
      state.loadingStates.users = ls;
    },

    updateUserSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.users = ls;
      state.mode = 'list';
      const updatedUsers = state.users.map((user) => {
        if (user.username === payload.username) {
          return {
            ...user,
            ...payload
          };
        } else {
          return user;
        }
      });
      state.users = updatedUsers;
    },

    updateUserError: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.users = ls;
    },

    addUser: (state) => {
      state.mode = 'addUser';
    },

    addUserStart: (state) => {
      const ls = { isLoading: true, operation: 'adding', errors: null };
      state.loadingStates.users = ls;
    },

    addUserSuccess: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.users = ls;
      state.mode = 'list';

      state.users = [
        ...state.users,
        {
          ...payload,
          email: payload.username
        }
      ];
    },

    addUserError: (state, { payload }) => {
      const ls = { isLoading: false, operation: null, errors: payload };
      state.loadingStates.users = ls;
    },

    cancel: (state) => {
      const ls = { isLoading: false, operation: null, errors: null };
      state.loadingStates.users = ls;
      state.mode = 'list';
    },

    clearUsers: (state) => {
      state.users = [];
      state.selectedUser = null;
      state.mode = 'list';
    },

    dismissManageUsersError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.users.errors.splice(index, 1);
    },
  }
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersError,
  editUser,
  updateUserSuccess,
  updateUserStart,
  updateUserError,
  addUser,
  addUserSuccess,
  addUserStart,
  addUserError,
  cancel,
  clearUsers,
  dismissManageUsersError
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

export const updateUser = (values) => {
  return async (dispatch, getState) => {
    try {
      dispatch(updateUserStart());
  
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;
  
      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'updateUser',
          input: values
        });
        dispatch(updateUserSuccess(values));
      }
    } catch (err) {
      dispatch(updateUserError(err));
    }
  }
}

export const createUser = (values) => {
  return async (dispatch, getState) => {
    try {
      dispatch(addUserStart());

      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);
      const projId = selectedProj._id;

      if (token && selectedProj) {
        const res = await call({
          projId,
          request: 'createUser',
          input: values
        });
        dispatch(addUserSuccess(values));
      }
    } catch (err) {
      dispatch(addUserError(err));
    }
  }
}

export const selectUsers = state => state.users.users;
export const selectMode = state => state.users.mode;
export const selectSelectedUser = state => state.users.selectedUser;
export const selectUsersLoading = state => state.users.loadingStates.users.isLoading;
export const selectManageUserErrors = state => state.users.loadingStates.users.errors;

export default userSlice.reducer;
