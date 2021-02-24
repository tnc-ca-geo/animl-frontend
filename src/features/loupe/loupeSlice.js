import { createSlice, createAction } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  reviewMode: false,
  iterationUnit: 'images',
  index: {
    images: null, 
    objects: 0,
    labels: 0,
  },
};

export const loupeSlice = createSlice({
  name: 'loupe',
  initialState,
  reducers: {

    imageSelected: (state, { payload }) => {
      state.open = true;
      state.index.images = Number(payload);
    },

    loupeClosed: (state) => {
      state.open = false;
      state.index.images = null;
    },

    reviewModeToggled: (state) => {
      state.reviewMode = !state.reviewMode;
    },

    iterationUnitChanged: (state, { payload }) => {
      state.iterationUnit = payload;
    },

    setIndices: (state, { payload }) => {
      state.index = Object.assign(state.index, payload);
    },

    labelValidated: (state, { payload }) => {
      const i = state.index;
      const object = state.images[i.images].objects[i.objects];
      const label = object.labels[i.labels];
      if (payload === true) {
        // validate
        label.validation = { validated: true };
        // lock
        object.locked = true;
      }
      else {
        // invalidate
        label.validation = { validated: false };;
      }
    },

  },
});

export const {
  imageSelected,
  loupeClosed,
  reviewModeToggled,
  iterationUnitChanged,
  setIndices,
  labelValidated,
} = loupeSlice.actions;

// Actions only used in middlewares:
export const incrementIndex = createAction('loupe/incrementIndex');

// Selectors
export const selectLoupeOpen = state => state.loupe.open;
export const selectReviewMode = state => state.loupe.reviewMode;
export const selectIndex = state => state.loupe.index;
export const selectIterationUnit = state => state.loupe.iterationUnit;

export default loupeSlice.reducer;
