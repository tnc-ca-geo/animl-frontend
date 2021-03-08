import { createSlice, createAction } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  reviewMode: false,
  isAddingObject: false,
  iterationOptions: {
    skipEmptyImages: false,
    skipLockedObjects: false,
    // skipInvalidatedLabels: false,    
  },
};

export const loupeSlice = createSlice({
  name: 'loupe',
  initialState,
  reducers: {

    loupeOpened: (state, { payload }) => {
      state.open = payload;
    },

    reviewModeToggled: (state) => {
      state.reviewMode = !state.reviewMode;
    },

    addObjectStart: (state) => {
      state.isAddingObject = true;
    },

    addObjectEnd: (state) => {
      if (state.isAddingObject) {
        state.isAddingObject = false;
      }
    },

    iterationOptionsChanged: (state, { payload }) => {
      state.iterationOptions = payload;
    },

  },
});

export const {
  loupeOpened,
  reviewModeToggled,
  addObjectStart,
  addObjectEnd,
  iterationOptionsChanged,
} = loupeSlice.actions;

// Selectors
export const selectLoupeOpen = state => state.loupe.open;
export const selectReviewMode = state => state.loupe.reviewMode;
export const selectIsAddingObject = state => state.loupe.isAddingObject;
export const selectIterationOptions = state => state.loupe.iterationOptions;

export default loupeSlice.reducer;
