import { createSlice, createAction } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  iterationUnit: 'images',
  index: {
    images: null, 
    labels: 0.
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

    iterationUnitChanged: (state, { payload }) => {
      state.iterationUnit = payload;
    },

    incrementImagesIndex: (state, { payload }) => {
      state.index.labels = 0;
      if (payload.delta === 'decrement' && state.index.images > 0) {
        state.index.images--;
      }
      else if (payload.delta === 'increment') {
        state.index.images++;
      }
    },

    incrementLabelsIndex: (state, { payload }) => {
      if (payload.delta === 'decrement' && state.index.labels > 0) {
        state.index.labels--;
      }
      else if (payload.delta === 'increment') {
        state.index.labels++;
      }
    },

  },
});

export const {
  imageSelected,
  loupeClosed,
  iterationUnitChanged,
  incrementImagesIndex,
  incrementLabelsIndex,
} = loupeSlice.actions;

export const incrementIndex = createAction('loupe/incrementIndex');


// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectLoupeOpen = state => state.loupe.open;
export const selectIndex = state => state.loupe.index;
export const selectIterationUnit = state => state.loupe.iterationUnit;

export default loupeSlice.reducer;
