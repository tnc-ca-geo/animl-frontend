import { createSlice, createAction } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';
import {
  getImagesSuccess,
  clearImages,
  updateObjectsSuccess
} from '../images/imagesSlice';
import { ObjectID } from 'bson';


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
      // update object ... 
      // and label's bboxes too? Or maybe not. Maybe we treat the object's 
      // bbox as the source of truth for bbox and preserve the original label's
      // bbox as is b/c that's what was submitted to or returned from ML.
      // Locked object is the the final product. ML labels and supporting bboxes
      // are just to help users get there faster. 
      object.bbox = payload.bbox;
    },

    objectAdded: (state, { payload }) => {
      console.log('reviewSlice.objectAdded(): ', payload);
      const objects = state.workingImages[payload.imageIndex].objects;
      // create object ... but maybe we don't want request createObject just yet?
      // wait until labels have been added?
      const newObject = {
        _id: new ObjectID().toString(),
        bbox: payload.bbox,
        locked: false,
        isBeingAdded: true,
        labels: [],
      };
      objects.unshift(newObject);
    },

    objectRemoved: (state, { payload }) => {
      console.log('reviewSlice.objectRemoved()');
      const objects = state.workingImages[payload.imageIndex].objects;
      // delete object not necessary to implement on backend
      objects.splice(payload.objectIndex, 1);
    },

    labelAdded: (state, { payload }) => {
      console.log('reviewSlice.labelAdded(): ', payload);
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      // create label - already have this in api
      const newLabel = {
        _id: new ObjectID().toString(),
        category: payload.category,
        bbox: object.bbox,
        validation: {
          validated: true,
          userId: payload.userId
        },  
        type: 'manual',
        conf: 1,
        userId: payload.userId
      };
      object.labels.unshift(newLabel);
      // update object - but, if this is a brand new object it doesn't exist
      // in API/DB yet. API would create a new object on it's own if it doesn't
      // find a matching one, but the _id would be wrong...
      object.locked = true;
      delete object.isBeingAdded
    },

    labelValidated: (state, { payload }) => {
      console.log('reviewSlice.labelValidated()');
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      // update label
      const label = object.labels[i.label];
      if (payload.validated === true) {
        label.validation = {
          validated: true,
          userId: payload.userId
        };
        // update object
        object.locked = true;
      }
      else {
        label.validation = {
          validated: false,
          userId: payload.userId
        };
      }
    },

    objectLocked: (state, { payload }) => {
      console.log('reviewSlice.objectLocked()');
      const i = payload.index;
      const object = state.workingImages[i.image].objects[i.object];
      // update object
      object.locked = payload.locked;
    },

  },

  extraReducers: (builder) => {
    // TODO: can we use extra reducers instead of middleware in a lot of places?
    // extraReducers are for handling actions not created by this slice
    // https://redux-toolkit.js.org/api/createslice/#extrareducers
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
