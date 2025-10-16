import { createSlice } from '@reduxjs/toolkit';
import { clearImages } from '../images/imagesSlice';

const initialState = {
  open: false,
  isDrawingBbox: false,
  isAddingLabel: null, // can be 'from-object' | 'from-image-table' | 'from-review-toolbar' | null
  isAddingTag: null, // can be 'from-image-table' | null
  mouseEventOutsideOverlay: null,
};

export const loupeSlice = createSlice({
  name: 'loupe',
  initialState,
  reducers: {
    toggleOpenLoupe: (state, { payload }) => {
      state.open = payload;
    },

    drawBboxStart: (state) => {
      state.isDrawingBbox = true;
    },

    drawBboxEnd: (state) => {
      if (state.isDrawingBbox) state.isDrawingBbox = false;
    },

    mouseEventDetected: (state, { payload }) => {
      state.mouseEventOutsideOverlay = payload.event;
    },

    clearMouseEventDetected: (state) => {
      state.mouseEventOutsideOverlay = null;
    },

    addLabelStart: (state, { payload }) => {
      state.isAddingLabel = payload;
    },

    addLabelEnd: (state) => {
      if (state.isAddingLabel) state.isAddingLabel = null;
    },

    addTagStart: (state, { payload }) => {
      // NOTE: right now, just dispatching this from the ImageTableRow's context menu
      // but in the future we may want to refactor the TagSelector.jsx used in the Loupe
      // to also use React Select, so it would dispatch addTagStart from there as well.
      // payload can be 'from-image-table' | null
      state.isAddingTag = payload;
    },

    addTagEnd: (state) => {
      if (state.isAddingTag) state.isAddingTag = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(clearImages, (state) => {
      state.open = false;
    });
  },
});

export const {
  toggleOpenLoupe,
  drawBboxStart,
  drawBboxEnd,
  mouseEventDetected,
  clearMouseEventDetected,
  addLabelStart,
  addLabelEnd,
  addTagStart,
  addTagEnd,
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
export const selectLoupeOpen = (state) => state.loupe.open;
export const selectIsDrawingBbox = (state) => state.loupe.isDrawingBbox;
export const selectMouseEventDetected = (state) => state.loupe.mouseEventOutsideOverlay;
export const selectIsAddingLabel = (state) => state.loupe.isAddingLabel;
export const selectIsAddingTag = (state) => state.loupe.isAddingTag;

export default loupeSlice.reducer;
