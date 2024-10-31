import { createSlice, createAction, createSelector } from '@reduxjs/toolkit';
import { Auth } from 'aws-amplify';
import { call } from '../../api';
import { findImage, findObject, findLabel, isImageReviewed } from '../../app/utils';
import { toggleOpenLoupe } from '../loupe/loupeSlice';
import { getImagesSuccess, clearImages, deleteImagesSuccess } from '../images/imagesSlice';

const initialState = {
  workingImages: [],
  focusIndex: {
    image: null,
    object: null,
    label: null,
  },
  selectedImageIndices: [],
  focusChangeType: null,
  loadingStates: {
    labels: {
      isLoading: false,
      operation: null /* 'fetching', 'updating', 'deleting' */,
      errors: null,
    },
    comments: {
      isLoading: false,
      operation: null /* 'fetching', 'updating', 'deleting' */,
      errors: null,
    },
    tags: {
      isLoading: false,
      operation: null /* 'fetching', 'deleting' */,
      errors: null,
    },
  },
  lastAction: null,
  lastCategoryApplied: null,
};

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setFocus: (state, { payload }) => {
      state.focusIndex = { ...state.focusIndex, ...payload.index };
      state.focusChangeType = payload.type;
      if (payload.index.image !== undefined && payload.index.image !== null) {
        state.selectedImageIndices = [payload.index.image];
      }
    },

    setSelectedImageIndices: (state, { payload }) => {
      state.selectedImageIndices = payload;
    },

    bboxUpdated: (state, { payload }) => {
      const { imgId, objId } = payload;
      const object = findObject(state.workingImages, imgId, objId);
      object.bbox = payload.bbox;
      const image = findImage(state.workingImages, imgId);
      image.reviewed = isImageReviewed(image);
    },

    objectsRemoved: (state, { payload }) => {
      for (const obj of payload.objects) {
        const image = findImage(state.workingImages, obj.imgId);
        const objectIndex = image.objects.findIndex((o) => o._id === obj.objId);
        image.objects.splice(objectIndex, 1);
        image.reviewed = isImageReviewed(image);
      }
    },

    labelsAdded: (state, { payload }) => {
      for (const label of payload.labels) {
        const { imgId, objId, objIsTemp, newObject, newLabel } = label;
        const image = findImage(state.workingImages, imgId);
        if (objIsTemp && newObject) {
          image.objects.unshift(newObject);
        } else {
          const object = image.objects.find((obj) => obj._id === objId);
          object.labels.unshift(newLabel);
        }
        image.reviewed = isImageReviewed(image);
      }
      state.lastAction = 'labels-added';
      state.lastCategoryApplied = payload.labels[0].labelId;
    },

    labelsRemoved: (state, { payload }) => {
      for (const label of payload.labels) {
        const { imgId, objId, newLabel } = label;
        const image = findImage(state.workingImages, imgId);
        const object = image.objects.find((obj) => obj._id === objId);
        const labelIndex = object.labels.findIndex((lbl) => lbl._id === newLabel._id);
        object.labels.splice(labelIndex, 1);

        // remove object if there aren't any labels left
        if (!object.labels.length) {
          const objectIndex = image.objects.findIndex((obj) => obj._id === objId);
          image.objects.splice(objectIndex, 1);
        }

        image.reviewed = isImageReviewed(image);
      }
    },

    labelsValidated: (state, { payload }) => {
      payload.labels.forEach(({ userId, imgId, objId, lblId, validated }) => {
        const label = findLabel(state.workingImages, imgId, objId, lblId);
        label.validation = { validated, userId };
        const image = findImage(state.workingImages, imgId);
        image.reviewed = isImageReviewed(image);
      });

      state.lastAction = payload.labels[0].validated ? 'labels-validated' : 'labels-invalidated';
    },

    labelsValidationReverted: (state, { payload }) => {
      // for undoing a validation
      payload.labels.forEach(({ imgId, objId, lblId, oldValidation, oldLocked }) => {
        const object = findObject(state.workingImages, imgId, objId);
        object.locked = oldLocked;
        const label = findLabel(state.workingImages, imgId, objId, lblId);
        label.validation = oldValidation;
        const image = findImage(state.workingImages, imgId);
        image.reviewed = isImageReviewed(image);
      });
    },

    objectsLocked: (state, { payload }) => {
      payload.objects.forEach(({ imgId, objId, locked }) => {
        const object = findObject(state.workingImages, imgId, objId);
        object.locked = locked;
        const image = findImage(state.workingImages, imgId);
        image.reviewed = isImageReviewed(image);
      });
    },

    markedEmpty: (state, { payload }) => {
      for (const img of payload.images) {
        if (img.newObject) {
          const image = findImage(state.workingImages, img.imgId);
          image.objects.push(img.newObject);
          image.reviewed = isImageReviewed(image);
        }
      }
      state.lastAction = 'marked-empty';
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

    editLabelSuccess: (state) => {
      // NOTE: currently not doing anything with returned image
      state.loadingStates.labels.isLoading = false;
      state.loadingStates.labels.operation = null;
      state.loadingStates.labels.errors = null;
    },

    editCommentStart: (state, { payload }) => {
      state.loadingStates.comments.isLoading = true;
      state.loadingStates.comments.operation = payload;
    },

    editCommentFailure: (state, { payload }) => {
      state.loadingStates.comments.isLoading = false;
      state.loadingStates.comments.operation = null;
      state.loadingStates.comments.errors = payload;
    },

    editCommentSuccess: (state, { payload }) => {
      state.loadingStates.comments.isLoading = false;
      state.loadingStates.comments.operation = null;
      state.loadingStates.comments.errors = null;
      const image = findImage(state.workingImages, payload.imageId);
      image.comments = payload.comments;
    },

    editTagStart: (state, { payload }) => {
      state.loadingStates.tags.isLoading = true;
      state.loadingStates.tags.operation = payload;
    },

    editTagFailure: (state, { payload }) => {
      state.loadingStates.tags.isLoading = false;
      state.loadingStates.tags.operation = null;
      state.loadingStates.tags.errors = payload;
    },

    editTagSuccess: (state, { payload }) => {
      state.loadingStates.tags.isLoading = false;
      state.loadingStates.tags.operation = null;
      state.loadingStates.tags.errors = null;
      const image = findImage(state.workingImages, payload.imageId);
      image.tags = payload.tags;
    },

    dismissLabelsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.labels.errors.splice(index, 1);
    },

    dismissCommentsError: (state, { payload }) => {
      const index = payload;
      state.loadingStates.comments.errors.splice(index, 1);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getImagesSuccess, (state, { payload }) => {
        const newImages = payload.images.images;
        state.workingImages = state.workingImages.concat(newImages);
      })
      .addCase(clearImages, (state) => {
        state.workingImages = initialState.workingImages;
        state.selectedImageIndices = initialState.selectedImageIndices;
        state.focusIndex = initialState.focusIndex;
      })
      .addCase(toggleOpenLoupe, (state, { payload }) => {
        if (payload === false) {
          state.lastAction = null;
          state.lastCategoryApplied = null;
        }
      })
      .addCase(deleteImagesSuccess, (state, { payload }) => {
        state.workingImages = state.workingImages.filter(({ _id }) => !payload.includes(_id));
      });
  },
});

export const {
  setFocus,
  setSelectedImageIndices,
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
  editCommentStart,
  editCommentFailure,
  editCommentSuccess,
  editTagStart,
  editTagFailure,
  editTagSuccess,
  dismissLabelsError,
  dismissCommentsError,
} = reviewSlice.actions;

// editLabel thunk
export const editLabel = (operation, entity, payload) => {
  return async (dispatch, getState) => {
    try {
      if (
        (payload.updates && !payload.updates.length) ||
        (payload.objects && !payload.objects.length) ||
        (payload.labels && !payload.labels.length)
      ) {
        return;
      }

      if (!operation || !entity || !payload) {
        const msg = `An operation (create, update, or delete) 
          and entity are required`;
        throw new Error(msg);
      }

      dispatch(editLabelStart());
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const req = operation + entity.charAt(0).toUpperCase() + entity.slice(1);
        await call({
          projId: selectedProj._id,
          request: req,
          input: payload,
        });
        dispatch(editLabelSuccess());
      }
    } catch (err) {
      console.log(`error attempting to ${operation} ${entity}: `, err);
      dispatch(editLabelFailure(err));
    }
  };
};

// editComment thunk
export const editComment = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      console.log('editComment - operation: ', operation);
      console.log('editComment - payload: ', payload);

      if (!operation || !payload) {
        const msg = `An operation (create, update, or delete) and payload is required`;
        throw new Error(msg);
      }

      dispatch(editCommentStart(operation));
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const req = `${operation}ImageComment`;
        console.log('req: ', req);

        const res = await call({
          projId: selectedProj._id,
          request: req,
          input: payload,
        });
        console.log('editComment - res: ', res);
        const mutation = Object.keys(res)[0];
        const comments = res[mutation].comments;
        dispatch(editCommentSuccess({ imageId: payload.imageId, comments }));
      }
    } catch (err) {
      console.log(`error attempting to ${operation}ImageComment: `, err);
      dispatch(editCommentFailure(err));
    }
  };
};

export const editTag = (operation, payload) => {
  return async (dispatch, getState) => {
    try {
      console.log('editTag - operation: ', operation);
      console.log('editTag - payload: ', payload);

      if (!operation || !payload) {
        const msg = `An operation (create or delete) and payload is required`;
        throw new Error(msg);
      }

      dispatch(editTagStart(operation));
      const currentUser = await Auth.currentAuthenticatedUser();
      const token = currentUser.getSignInUserSession().getIdToken().getJwtToken();
      const projects = getState().projects.projects;
      const selectedProj = projects.find((proj) => proj.selected);

      if (token && selectedProj) {
        const req = `${operation}ImageTag`;
        console.log('req:',req);

        const res = await call({
          projId: selectedProj._id,
          request: req,
          input: payload,
        });
        console.log('editTag - res: ', res);
        const mutation = Object.keys(res)[0];
        const tags = res[mutation].tags;
        dispatch(editTagSuccess({ imageId: payload.imageId, tags }));
      }
    } catch (err) {
      console.log(`error attempting to ${operation}ImageTag: `, err);
      dispatch(editTagFailure(err));
    }
  };
};

// Actions only used in middlewares:
export const incrementFocusIndex = createAction('review/incrementFocusIndex');
export const incrementImage = createAction('review/incrementImage');
export const objectsManuallyUnlocked = createAction('review/objectsManuallyUnlocked');
export const markedEmptyReverted = createAction('review/markedEmptyReverted');

export const selectWorkingImages = (state) => state.review.workingImages;
export const selectFocusIndex = (state) => state.review.focusIndex;
export const selectSelectedImageIndices = (state) => state.review.selectedImageIndices;
export const selectFocusChangeType = (state) => state.review.focusChangeType;
export const selectLabelsErrors = (state) => state.review.loadingStates.labels.errors;
export const selectCommentsErrors = (state) => state.review.loadingStates.comments.errors;
export const selectCommentsLoading = (state) => state.review.loadingStates.comments.isLoading;
export const selectTagsErrors = (state) => state.review.loadingStates.tags.errors;
export const selectTagsLoading = (state) => state.review.loadingStates.comments.isLoading;
export const selectLastAction = (state) => state.review.lastAction;
export const selectLastCategoryApplied = (state) => state.review.lastCategoryApplied;
export const selectSelectedImages = createSelector(
  [selectWorkingImages, selectSelectedImageIndices],
  (workingImages, selectedImageIndices) => {
    let selectedImages = [];
    if (workingImages.length && selectedImageIndices.length) {
      selectedImages = selectedImageIndices.map((i) => workingImages[i]);
    }
    return selectedImages;
  },
);

export default reviewSlice.reducer;
