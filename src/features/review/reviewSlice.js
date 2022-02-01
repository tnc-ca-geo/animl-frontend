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
      const { imgId, objId } = payload;
      const object = findObject(state.workingImages, imgId, objId);
      object.bbox = payload.bbox;
    },

    objectRemoved: (state, { payload }) => {
      console.log('reviewSlice.objectRemoved(): ', payload);
      const image = findImage(state.workingImages, payload.imgId);
      const objectIndex = image.objects.findIndex((obj) => (
        obj._id === payload.objId
      ));
      image.objects.splice(objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const { imgId, objId, objIsTemp, newObject, newLabel } = payload;
      const image = findImage(state.workingImages, imgId);
      if (objIsTemp && newObject) {
        image.objects.unshift(newObject);
      }
      else {
        const object = image.objects.find((obj) => obj._id === objId);
        object.labels.unshift(newLabel);
      }
    },

    labelRemoved: (state, { payload }) => {
      console.log('reviewSlice.labelRemoved(): ', payload);
      const { imgId, objId, newLabel } = payload;
      const image = findImage(state.workingImages, imgId);
      const object = image.objects.find((obj) => obj._id === objId);
      const labelIndex = object.labels.findIndex((lbl) => (
        lbl._id === newLabel._id
      ));
      object.labels.splice(labelIndex, 1);

      // remove object if there aren't any labels left 
      if (!object.labels.length) {
        console.log('INFO: no more labels on object, so removing it');
        const objectIndex = image.objects.findIndex((obj) => obj._id === objId);
        image.objects.splice(objectIndex, 1);
      }
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated() - ', payload);
      const { userId, imgId, objId, lblId, validated } = payload;
      const label = findLabel(state.workingImages, imgId, objId, lblId);
      label.validation = { validated, userId };
    },

    labelValidationReverted: (state, { payload }) => { // for undoing a validation
      console.log('reviewSlice.labelValidationReverted() - ', payload);
      const { imgId, objId, lblId } = payload;
      const label = findLabel(state.workingImages, imgId, objId, lblId);
      label.validation = payload.oldValidation;
    },

    objectLocked: (state, { payload }) => {
      console.log('reviewSlice.objectLocked()');
      const { imgId, objId } = payload;
      const object = findObject(state.workingImages, imgId, objId);
      object.locked = payload.locked;
    },

    markedEmpty: (state, { payload }) => {
      if (payload.newObject) {
        const image = findImage(state.workingImages, payload.imgId);
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
        // TODO: we don't use updateObject anymore, so this isn't doing anything
        // consider pushing returned images from editLabelSuccess into
        // working images instead? 
        const imgId = payload.updateObjects.image._id;
        const newObjects = payload.updateObjects.image.objects;
        const image = state.workingImages.find(img => img._id === imgId);
        image.objects = newObjects;
      });
  },

});

export const {
  setFocus,
  bboxUpdated,
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

export const selectWorkingImages = state => state.review.workingImages;
export const selectFocusIndex = state => state.review.focusIndex;
export const selectFocusChangeType = state => state.review.focusChangeType;

export default reviewSlice.reducer;
