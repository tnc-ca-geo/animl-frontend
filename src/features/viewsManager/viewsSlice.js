import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getViews } from '../../api/animlAPI';
// import moment from 'moment';
// import {
//   DATE_FORMAT_EXIF as DFE,
//   DATE_FORMAT_READABLE as DFR,
// } from '../../config';

const initialState = {
  views: [],
  isLoading: false,
  error: null,
};

export const viewsSlice = createSlice({
  name: 'views',
  initialState,
  reducers: {

    getViewsStart: (state) => { state.isLoading = true; },

    getViewsFailure: (state, { payload }) => {
      state.isLoading = false;
      state.error = payload;
    },

    getViewsSuccess: (state, { payload }) => {
      state.isLoading = false;
      state.error = null;
      console.log('getViewsSuccess payload: ', payload);
      // state.views = payload.views;
      // payload.cameras.forEach((view) => {
      //   if (!(camera._id in state.cameras.cameras)) {
      //     state.cameras.cameras[camera._id] = { selected: true };
      //   }
      // });
    },

  },
});

export const {
  getViewsStart,
  getViewsFailure,
  getViewsSuccess,
} = viewsSlice.actions;

// fetchViews thunk
export const fetchViews = () => async dispatch => {
  try {
    dispatch(getViewsStart());
    const views = await getViews();
    dispatch(getViewsSuccess(views))
  } catch (err) {
    dispatch(getViewsFailure(err.toString()))
  }
};

// Selectors
export const selectViews = state => state.views.views;
export const selectSelectedView = createSelector(
  [selectViews],
  (views) => views.filter((view) => view.selected)[0]
);

// export const selectCameraFilter = state => state.filters.cameras;
// export const selectDateCreatedFilter = state => state.filters.dateCreated;
// export const selectDateAddedFilter = state => state.filters.dateAdded;
// export const selectLabelFilter = state => state.filters.labels;

export default viewsSlice.reducer;
