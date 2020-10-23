import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    screenWidth: (typeof window === 'object') ? window.innerWidth : null,
  },
  reducers: {
    screenResized: (state, { payload }) => {
      console.log('screen resized: ', payload);
      state.screenWidth = payload.width;
    },
  },
});

export const {
  screenResized,
} = uiSlice.actions;

// Selectors
export const selectScreenWidth = state => state.ui.screenWidth;

export default uiSlice.reducer;
