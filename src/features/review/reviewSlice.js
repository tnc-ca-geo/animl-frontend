import { createSlice, createAction } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';
import {
  getImagesSuccess,
  clearImages,
  updateObjectsSuccess
} from '../images/imagesSlice';


const initialState = {
  workingImages: [],
  focusIndex: {
    image: null, 
    object: null,
    label: null,
  },
  updatingObjects: false,
  error: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {

    setFocus: (state, { payload }) => {
      console.log('reviewSlice.setFocus(): ', payload);
      state.focusIndex = { ...state.focusIndex, ...payload };
    },

    bboxUpdated: (state, { payload }) => {
      console.log('reviewSlice.bboxUpdated()');
      const { imageIndex, objectIndex } = payload;
      const object = state.workingImages[imageIndex].objects[objectIndex];
      object.bbox = payload.bbox;
    },

    objectAdded: (state, { payload }) => {
      console.log('reviewSlice.objectAdded(): ', payload);
      const objects = state.workingImages[payload.imageIndex].objects;
      payload.newObject.isBeingAdded = true; 
      objects.unshift(payload.newObject);
    },

    objectRemoved: (state, { payload }) => {
      console.log('reviewSlice.objectRemoved()');
      const objects = state.workingImages[payload.imageIndex].objects;
      objects.splice(payload.objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      object.labels.unshift(payload.newLabel);
      object.locked = true;
      delete object.isBeingAdded
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated()');
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      const label = object.labels[i.label];
      if (payload.validated === true) {
        label.validation = {
          validated: true,
          userId: payload.userId
        };
        object.locked = true;
      }
      else {
        label.validation = {
          validated: false,
          userId: payload.userId
        };
        object.locked = object.labels.every((lbl) => (
          lbl.validation && lbl.validation.validated === false
        ));
      }
    },

    objectLocked: (state, { payload }) => {
      console.log('reviewSlice.objectLocked()');
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      // update object
      object.locked = payload.locked;
    },

    markedEmpty: (state, { payload }) => {
      if (payload.newObject) {
        const image = state.workingImages[payload.imageIndex];
        image.objects.push(payload.newObject);
      }
    },

  },

  extraReducers: (builder) => {
    builder
      .addCase(getImagesSuccess, (state, { payload }) => {
        const newImages = payload.images.images;
        state.workingImages = state.workingImages.concat(newImages);
      })
      .addCase(clearImages, (state) => {
        state.workingImages = [];
      })
      .addCase(updateObjectsSuccess, (state, { payload }) => {
        const imageId = payload.updateObjects.image._id;
        const newObjects = payload.updateObjects.image.objects;
        const image = state.workingImages.find(img => img._id === imageId);
        image.objects = newObjects;
      });
  },

});

export const {
  setFocus,
  bboxUpdated,
  objectAdded,
  objectRemoved,
  labelAdded,
  labelValidated,
  objectLocked,
  markedEmpty,
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
