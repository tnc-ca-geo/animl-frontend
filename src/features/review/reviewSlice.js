import { createSlice, createAction } from '@reduxjs/toolkit';
// import undoable, { excludeAction } from 'redux-undo';
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
  focusChangeType: null,
  updatingObjects: false,
  error: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {

    setFocus: (state, { payload }) => {
      console.log('reviewSlice.setFocus(): ', payload);
      state.focusIndex = { ...state.focusIndex, ...payload.index };
      state.focusChangeType = payload.type;
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
      // TODO: double check this is getting properly removed after objectRemoved 
      // and during undo/redo process 
      payload.newObject.isBeingAdded = true; 
      objects.unshift(payload.newObject);
    },

    objectRemoved: (state, { payload }) => {
      const objects = state.workingImages[payload.imageIndex].objects;
      objects.splice(payload.objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      object.labels.unshift(payload.newLabel);
      object.locked = true;
      delete object.isBeingAdded;
    },

    labelRemoved: (state, { payload }) => { // only used for undoing labelAdded
      console.log('reviewSlice.labelRemoved(): ', payload);
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      object.labels.splice(payload.labelIndex, 1);
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated() - ', payload);
      const i = payload.index;
      const userId = payload.userId;
      const object = state.workingImages[i.image].objects[i.object];
      const label = object.labels[i.label];
      if (payload.validated === true) {
        label.validation = { validated: true, userId };
        // object.locked = true;  // set object.locked in objectLocked reducer (dispatch in middleware)
      }
      else {
        label.validation = { validated: false, userId };
        // object.locked = object.labels.every((lbl) => (
        //   lbl.validation && lbl.validation.validated === false
        // ));
      }
    },

    labelValidationReverted: (state, { payload }) => { // for undoing a validation
      console.log('reviewSlice.labelValidationReverted() - ', payload);
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      const label = object.labels[i.label];
      label.validation = payload.oldValidation;
      // object.locked = payload.oldLocked;  // set object.locked in objectLocked reducer (dispatch in middleware)
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
  labelRemoved,
  labelValidated,
  labelValidationReverted,
  objectLocked,
  markedEmpty,
} = reviewSlice.actions;

// Actions only used in middlewares:
export const incrementFocusIndex = createAction('review/incrementFocusIndex');
export const incrementImage = createAction('review/incrementImage');
export const objectManuallyUnlocked = createAction('review/objectManuallyUnlocked');
 
// The functions below are selectors and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectWorkingImages = state => state.review.workingImages;
export const selectFocusIndex = state => state.review.focusIndex;
export const selectFocusChangeType = state => state.review.focusChangeType;

export default reviewSlice.reducer;

// export default undoable(reviewSlice.reducer, { 
//   filter: excludeAction(objectAdded.toString()) 
// });

