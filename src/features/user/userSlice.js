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

    userAuthenticated: (state, { payload }) => {
      state.authState = payload.nextAuthState;
      if (payload.authData) {
        const idToken = payload.authData.signInUserSession.idToken.payload;
        state.username = idToken['cognito:username'];
        state.groups = idToken['cognito:groups'];
      }
    },

  },
});

export const {
  userAuthenticated,
} = userSlice.actions;

// Selectors
export const selectUserAuthState = state => state.user.authState;
export const selectUserGroups = state => state.user.groups;
export const selectUserUsername = state => state.user.username;

export default userSlice.reducer;
