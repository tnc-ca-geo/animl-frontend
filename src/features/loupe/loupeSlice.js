import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  reviewMode: false,
  isAddingObject: false,
  isAddingLabel: false,
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

    toggleOpenLoupe: (state, { payload }) => {
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

    addLabelStart: (state) => {
      state.isAddingLabel = true;
    },

    addLabelEnd: (state) => {
      if (state.isAddingLabel) {
        state.isAddingLabel = false;
      }
    },

    iterationOptionsChanged: (state, { payload }) => {
      state.iterationOptions = payload;
    },

  },
});

export const {
  toggleOpenLoupe,
  reviewModeToggled,
  addObjectStart,
  addObjectEnd,
  addLabelStart,
  addLabelEnd,
  iterationOptionsChanged,
} = loupeSlice.actions;

// Selectors
export const selectLoupeOpen = state => state.loupe.open;
export const selectReviewMode = state => state.loupe.reviewMode;
export const selectIsAddingObject = state => state.loupe.isAddingObject;
export const selectIsAddingLabel = state => state.loupe.isAddingLabel;
export const selectIterationOptions = state => state.loupe.iterationOptions;

export default loupeSlice.reducer;
