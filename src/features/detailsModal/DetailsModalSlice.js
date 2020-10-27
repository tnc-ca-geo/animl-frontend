import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  imageIndex: null,
};

export const detailsModalSlice = createSlice({
  name: 'detailsModal',
  initialState,
  reducers: {

    imageSelected: (state, { payload }) => {
      state.open = true;
      state.imageIndex = Number(payload);
    },

    detailsModalClosed: (state) => {
      state.open = false;
      state.imageIndex = null;
    },

    incrementImageIndex: (state, { payload }) => {
      if (payload.delta === 'decrement' && 
        state.imageIndex > 0) {
          state.imageIndex--;
      }
      else if (payload.delta === 'increment') {
        state.imageIndex++;
      }
    },

  },
});

export const {
  imageSelected,
  detailsModalClosed,
  incrementImageIndex,
} = detailsModalSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectDetailsOpen = state => state.detailsModal.open;
export const selectDetailsIndex = state => state.detailsModal.imageIndex;

export default detailsModalSlice.reducer;
