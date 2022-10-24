import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trackingInitialized: false,
  currentPage: null,
};

export const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {

    initTracking: (state) => {
      state.trackingInitialized = true;
    },

    setCurrentPage: (state, { payload }) => {
      state.currentPage = payload
    },

  },

});

export const {
  initTracking,
  setCurrentPage,
} = trackingSlice.actions;

export const selectTrackingInitialized = state => state.tracking.trackingInitialized;
export const selectCurrentPage = state => state.tracking.currentPage;

export default trackingSlice.reducer;
