import { createSlice, createAction } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';
import { getImagesSuccess, clearImages } from '../images/imagesSlice';
import { ObjectID } from 'bson';

const initialState = {
  workingImages: [],
  focusIndex: {
    image: null, 
    object: null,
    label: null,
  },
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {

    syncWorkingImages: (state, { payload }) => {
      console.log('syncWorkingImages: ', payload);
      // const newImgs = payload.payload.images.images;
      // state.workingImages = state.workingImages.concat(newImgs);
    },

    setFocus: (state, { payload }) => {
      console.log('imagesSlice.setFocus(): ', payload);
      state.focusIndex = { ...state.focusIndex, ...payload };
    },

    bboxUpdated: (state, { payload }) => {
      console.log('reviewSlice.bboxUpdated()');
      const { imageIndex, objectIndex } = payload;
      const object = state.objects[imageIndex][objectIndex];
      object.bbox = payload.bbox;
    },

    objectAdded: (state, { payload }) => {
      console.log('reviewSlice.objectAdded(): ', payload);
      const newObject = {
        _id: new ObjectID().toString(),
        bbox: payload.bbox,
        locked: false,
        isBeingAdded: true,
        labels: [],
      };
      state.objects[payload.imageIndex].unshift(newObject);
    },

    objectRemoved: (state, { payload }) => {
      console.log('reviewSlice.objectRemoved()');
      state.objects[payload.imageIndex].splice(payload.objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const i = payload.index;
      const object = state.objects[i.image][i.object];
      const newLabel = {
        category: payload.category,
        bbox: object.bbox,
        validation: { validated: true },
        type: 'manual',
        conf: 1,
      };
      object.labels.unshift(newLabel);
      object.locked = true;
      object.isBeingAdded = false;
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated()');
      const i = payload.index;
      const object = state.objects[i.image][i.object];
      const label = object.labels[i.label];
      if (payload.validated === true) {
        label.validation = { validated: true };
        object.locked = true;
      }
      else {
        label.validation = { validated: false };
      }
    },

    objectLocked: (state, { payload }) => {
      console.log('reviewSlice.objectLocked()');
      const i = payload.index;
      const object = state.objects[i.image][i.object];
      object.locked = payload.locked;
    },

  },
  extraReducers: (builder) => {
    // TODO: can we use extra reducers instead of middleware in a lot of places?
    // extraReducers are for handling actions not created by this slice
    // https://redux-toolkit.js.org/api/createslice/#extrareducers
    builder
      .addCase(getImagesSuccess, (state, { payload }) => {
        console.log('get images success from reviews slice')
        const newImages = payload.images.images
        state.workingImages = state.workingImages.concat(newImages);
      })
      .addCase(clearImages, (state) => {
        console.log('clear images from reviews slice');
        state.workingImages = [];
      })
  },
});

export const {
  clearWorkingImages,
  syncWorkingImages,
  setFocus,
  bboxUpdated,
  objectAdded,
  objectRemoved,
  labelAdded,
  labelValidated,
  objectLocked,
} = reviewSlice.actions;

// Actions only used in middlewares:
export const incrementFocusIndex = createAction('loupe/incrementFocusIndex');
export const incrementImage = createAction('loupe/incrementImage');
 
// The functions below are selectors and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectWorkingImages = state => state.review.present.workingImages;
export const selectFocusIndex = state => state.review.present.focusIndex;

export default undoable(reviewSlice.reducer, { 
  filter: excludeAction(objectAdded.toString()) 
});
