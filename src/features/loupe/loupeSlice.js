import { createSlice, createAction } from '@reduxjs/toolkit';
import undoable from 'redux-undo';

const initialState = {
  open: false,
  reviewMode: false,
  isAddingObject: false,
  iterationOptions: {
    skipEmptyImages: false,
    skipLockedObjects: false,
    // skipInvalidatedLabels: false,    
  },
  // TODO: break index out into it's own slice (or move it to images?)
  // b/c we don't want to track the 
  // rest of this state for undo/redo
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

    setIndices: (state, { payload }) => {
      state.index = Object.assign(state.index, payload);
    },

  },
});

export const {
  imageSelected,
  loupeClosed,
  reviewModeToggled,
  addObjectStart,
  addObjectEnd,
  iterationOptionsChanged,
  setIndices,
} = loupeSlice.actions;

// Actions only used in middlewares:
export const incrementIndex = createAction('loupe/incrementIndex');
export const incrementImage = createAction('loupe/incrementImage');


// Selectors
export const selectLoupeOpen = state => state.loupe.present.open;
export const selectReviewMode = state => state.loupe.present.reviewMode;
export const selectIsAddingObject = state => state.loupe.present.isAddingObject;
export const selectLoupeIndex = state => state.loupe.present.index;
export const selectIterationOptions = state => state.loupe.present.iterationOptions;

export default undoable(loupeSlice.reducer);
