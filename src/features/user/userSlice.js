import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: null,
  groups: [],
  authState: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    userAuthStateChanged: (state, { payload }) => {
      state.authState = payload.nextAuthState;
      state.username = payload.username ? payload.username : null;
      state.groups = payload.groups ? payload.groups : null;
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
