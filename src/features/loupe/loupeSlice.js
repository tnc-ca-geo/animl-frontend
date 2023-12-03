import { createSlice } from '@reduxjs/toolkit';
import { clearImages } from '../images/imagesSlice';

const initialState = {
  open: false,
  reviewMode: false,
  isDrawingBbox: false,
  isAddingLabel: false,
  mouseUpOutsideOverlay: false,
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

    toggleOpenLoupe: (state, { payload }) => { state.open = payload; },

    reviewModeToggled: (state) => { state.reviewMode = !state.reviewMode; },

    drawBboxStart: (state) => { state.isDrawingBbox = true; },

    drawBboxEnd: (state) => {
      if (state.isDrawingBbox) state.isDrawingBbox = false;
    },

    mouseUpDetected: (state) => {
      state.mouseUpOutsideOverlay = true;
    },

    clearMouseUpDetected: (state) => {
      state.mouseUpOutsideOverlay = false;
    },

    addLabelStart: (state) => { state.isAddingLabel = true; },

    addLabelEnd: (state) => {
      if (state.isAddingLabel) state.isAddingLabel = false;
    },

    iterationOptionsChanged: (state, { payload }) => {
      state.iterationOptions = payload;
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(clearImages, (state) => { state.open = false; });
  }

});

export const {
  toggleOpenLoupe,
  reviewModeToggled,
  drawBboxStart,
  drawBboxEnd,
  mouseUpDetected,
  clearMouseUpDetected,
  addLabelStart,
  addLabelEnd,
  iterationOptionsChanged,
} = loupeSlice.actions;

// editLabel thunk
export const copyUrlToClipboard = (url) => {
  return async () => {
    try {
      await navigator.clipboard.writeText(url);
      console.log('Content copied to clipboard: ', url);
    } catch (err) {
      console.log(`error attempting to copy to clipboard: `, err);
    }
  };
};


// Selectors
export const selectLoupeOpen = state => state.loupe.open;
export const selectReviewMode = state => state.loupe.reviewMode;
export const selectIsDrawingBbox = state => state.loupe.isDrawingBbox;
export const selectMouseUpOutsideOverlay = state => state.loupe.mouseUpOutsideOverlay;
export const selectIsAddingLabel = state => state.loupe.isAddingLabel;
export const selectIterationOptions = state => state.loupe.iterationOptions;

export default loupeSlice.reducer;
