import { createSlice, createAction } from '@reduxjs/toolkit';
// import undoable, { excludeAction } from 'redux-undo';
import { findImage, findObject, findLabel } from '../../app/utils';
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
      console.log('reviewSlice.bboxUpdated() - ', payload);
      const { imageId, objectId } = payload;
      const object = findObject(state.workingImages, imageId, objectId);
      object.bbox = payload.bbox;
    },

    objectAdded: (state, { payload }) => {
      console.log('reviewSlice.objectAdded(): ', payload);
      const image = findImage(state.workingImages, payload.imageId);
      // TODO: double check this is getting properly removed after objectRemoved 
      // and during undo/redo process 
      payload.newObject.isBeingAdded = true; 
      image.objects.unshift(payload.newObject);
    },

    objectRemoved: (state, { payload }) => {
      console.log('reviewSlice.objectRemoved(): ', payload);
      const image = findImage(state.workingImages, payload.imageId);
      const objectIndex = image.objects.findIndex((obj) => (
        obj._id.toString() === payload.objectId.toString()
      ));
      image.objects.splice(objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const { imageId, objectId, objIsBeingAdded, newObject, newLabel } = payload;
      const image = findImage(state.workingImages, imageId);
      if (objIsBeingAdded && newObject) {
        image.objects.unshift(newObject);
      }
      else {
        const object = image.objects.find((obj) => (
          obj._id.toString() === objectId.toString()
        ));
        object.labels.unshift(newLabel);
      }
    },

    labelRemoved: (state, { payload }) => { // only used for undoing labelAdded
      console.log('reviewSlice.labelRemoved(): ', payload);
      const { imageId, objectId, newLabel } = payload;
      const image = findImage(state.workingImages, imageId);
      const object = image.objects.find((obj) => (
        obj._id.toString() === objectId.toString()
      ));
      const labelIndex = object.labels.findIndex((lbl) => (
        lbl._id.toString() === newLabel._id.toString()
      ))
      object.labels.splice(labelIndex, 1);

      // remove object if there aren't any labels left 
      if (!object.labels.length) {
        const objectIndex = image.objects.findIndex((obj) => (
          obj._id.toString() === objectId.toString()
        ));
        image.objects.splice(objectIndex, 1);
      }
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated() - ', payload);
      const { userId, imageId, objectId, labelId, validated } = payload;
      const label = findLabel(state.workingImages, imageId, objectId, labelId);
      console.log('reviewSlice.labelValidated() - found label', label);
      label.validation = { validated, userId };
    },

    labelValidationReverted: (state, { payload }) => { // for undoing a validation
      console.log('reviewSlice.labelValidationReverted() - ', payload);
      const { imageId, objectId, labelId } = payload;
      const label = findLabel(state.workingImages, imageId, objectId, labelId);
      label.validation = payload.oldValidation;
    },

    objectLocked: (state, { payload }) => {
      console.log('reviewSlice.objectLocked()');
      const { imageId, objectId } = payload;
      const object = findObject(state.workingImages, imageId, objectId);
      object.locked = payload.locked;
    },

    markedEmpty: (state, { payload }) => {
      if (payload.newObject) {
        const image = findImage(state.workingImages, payload.imageId);
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
export const markedEmptyReverted = createAction('review/markedEmptyReverted');
 
// The functions below are selectors and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
// You can also use Reselect's createSelector to create memoized selector funcs:
// https://redux-toolkit.js.org/tutorials/intermediate-tutorial#optimizing-todo-filtering
export const selectWorkingImages = state => state.review.workingImages;
export const selectFocusIndex = state => state.review.focusIndex;
export const selectFocusChangeType = state => state.review.focusChangeType;

export default reviewSlice.reducer;

