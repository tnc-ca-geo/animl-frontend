import { createSlice, createAction } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { findImage, findObject, findLabel } from '../../app/utils';
import { getImagesSuccess, clearImages, deleteImagesSuccess } from '../images/imagesSlice';

const initialState = {
  workingImages: [],
  focusIndex: {
    image: null, 
    object: null,
    label: null,
  },
  focusChangeType: null,
  loadingStates: {
    labels: {
      isLoading: false,
      operation: null, /* 'fetching', 'updating', 'deleting' */
      errors: null,
    },
    images: {
      isLoading: false,
      operation: null, /* 'deleting' */
      errors: null,
    }
  }
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {

    setFocus: (state, { payload }) => {
      state.focusIndex = { ...state.focusIndex, ...payload.index };
      state.focusChangeType = payload.type;
    },

    bboxUpdated: (state, { payload }) => {
      console.log('reviewSlice.bboxUpdated() - ', payload);
      const { imgId, objId } = payload;
      const object = findObject(state.workingImages, imgId, objId);
      object.bbox = payload.bbox;
    },

    objectsRemoved: (state, { payload }) => {
      for (const obj of payload.objects) {
        const image = findImage(state.workingImages, obj.imgId);
        const objectIndex = image.objects.findIndex((o) => o._id === obj.objId);
        image.objects.splice(objectIndex, 1);
      }
    },

    labelsAdded: (state, { payload }) => {
      for (const label of payload.labels) {
        const { imgId, objId, objIsTemp, newObject, newLabel } = label;
        const image = findImage(state.workingImages, imgId);
        if (objIsTemp && newObject) {
          image.objects.unshift(newObject);
        }
        else {
          const object = image.objects.find((obj) => obj._id === objId);
          object.labels.unshift(newLabel);
        }
      }
    },

    labelsRemoved: (state, { payload }) => {
      for (const label of payload.labels) {
        const { imgId, objId, newLabel } = label;
        const image = findImage(state.workingImages, imgId);
        const object = image.objects.find((obj) => obj._id === objId);
        const labelIndex = object.labels.findIndex((lbl) => (
          lbl._id === newLabel._id
        ));
        object.labels.splice(labelIndex, 1);
  
        // remove object if there aren't any labels left 
        if (!object.labels.length) {
          const objectIndex = image.objects.findIndex((obj) => obj._id === objId);
          image.objects.splice(objectIndex, 1);
        }
      }
    },

    labelsValidated: (state, { payload }) => {
      console.log('reviewSlice - labelsValidated - payload: ', payload);
      payload.labels.forEach(({ userId, imgId, objId, lblId, validated }) => {
        const label = findLabel(state.workingImages, imgId, objId, lblId);
        label.validation = { validated, userId };
      });
    },

    labelsValidationReverted: (state, { payload }) => { // for undoing a validation
      console.log('reviewSlice - labelsValidationReverted - payload: ', payload);
      payload.labels.forEach(({ imgId, objId, lblId, oldValidation, oldLocked }) => {
        const object = findObject(state.workingImages, imgId, objId);
        object.locked = oldLocked;
        const label = findLabel(state.workingImages, imgId, objId, lblId);
        label.validation = oldValidation;
      });
    },

    objectsLocked: (state, { payload }) => {
      console.log('reviewSlice - objectsLocked - payload: ', payload);
      payload.objects.forEach(({ imgId, objId, locked }) => {
        const object = findObject(state.workingImages, imgId, objId);
        object.locked = locked;
      });
    },

    markedEmpty: (state, { payload }) => {
      for (const img of payload.images) {
        if (img.newObject) {
          const image = findImage(state.workingImages, img.imgId);
          image.objects.push(img.newObject);
        }
      }
    },

    editLabelStart: (state) => { 
      state.loadingStates.labels.isLoading = true;
      state.loadingStates.labels.operation = 'updating';
    },

    editLabelFailure: (state, { payload }) => {
      state.loadingStates.labels.isLoading = false;
      state.loadingStates.labels.operation = null;
      state.loadingStates.labels.errors = payload;
    },

    editLabelSuccess: (state, { payload }) => {
      // NOTE: currently not doing anything with returned image
      state.loadingStates.labels.isLoading = false;
      state.loadingStates.labels.operation = null;
      state.loadingStates.labels.errors = null;
    },

    dismissLabelsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.labels.errors.splice(index, 1);
    }
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
      .addCase(deleteImagesSuccess, (state, { payload }) => {
        state.workingImages = state.workingImages.filter(
          ({ _id }) => !payload.includes(_id)
        );
      })
  },

});

export const {
  setFocus,
  bboxUpdated,
  objectsRemoved,
  labelsAdded,
  labelsRemoved,
  labelsValidated,
  labelsValidationReverted,
  objectsLocked,
  markedEmpty,
  editLabelStart,
  editLabelFailure,
  editLabelSuccess,
  dismissLabelsError,
} = reviewSlice.actions;

// editLabel thunk
export const editLabel = (operation, entity, payload, projId) => {
  return async (dispatch, getState) => {
    try {

      if (!operation || !entity || !payload) {
        const msg = `An operation (create, update, or delete) 
          and entity are required`;
        throw new Error(msg);
      }

      console.log(`Attempting ${operation} ${entity} with payload: `, payload);

      dispatch(editLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const req = operation + entity.charAt(0).toUpperCase() + entity.slice(1);
        const res = await call({
          projId: selectedProj._id, 
          request: req,
          input: payload 
        });
        const mutation = Object.keys(res)[0];
        const image = res[mutation].image;
        dispatch(editLabelSuccess(image));
      }

    } catch (err) {
      console.log(`error attempting to ${operation} ${entity}: `, err);
      dispatch(editLabelFailure(err));
    }
  };
};

// Actions only used in middlewares:
export const incrementFocusIndex = createAction('review/incrementFocusIndex');
export const incrementImage = createAction('review/incrementImage');
export const objectManuallyUnlocked = createAction('review/objectManuallyUnlocked');
export const markedEmptyReverted = createAction('review/markedEmptyReverted');

export const selectWorkingImages = state => state.review.workingImages;
export const selectFocusIndex = state => state.review.focusIndex;
export const selectFocusChangeType = state => state.review.focusChangeType;
export const selectLabelsErrors = state => state.review.loadingStates.labels.errors;

export default reviewSlice.reducer;
