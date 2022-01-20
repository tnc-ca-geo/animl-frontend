import { createUndoMiddleware } from 'redux-undo-redo';
import {
  setFocus,
  bboxUpdated,
  labelAdded,
  objectAdded,
  objectRemoved,
  objectLocked,
  objectManuallyUnlocked,
  labelValidated,
  labelValidationReverted,
  selectWorkingImages,
  selectFocusIndex,
  labelRemoved,
  markedEmpty,
  markedEmptyReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const undoMiddleware = createUndoMiddleware({
  revertingActions: {

    // // setFocus
    // [setFocus.toString()]: {
    //   action: (action, { oldFocus }) => (
    //     setFocus({ index: oldFocus, type: action.payload.type })
    //   ),
    //   createArgs: (state, action) => ({ oldFocus: selectFocusIndex(state) })
    // },

    // bboxUpdated
    [bboxUpdated.toString()]: {
      action: (action, { oldBbox }) => ( 
        bboxUpdated({
          imgId: action.payload.imgId,
          objId: action.payload.objId,
          bbox: oldBbox
        })
      ),
      createArgs: (state, action) => { 
        const workingImages = selectWorkingImages(state);
        const { imgId, objId } = action.payload;
        const object = findObject(workingImages, imgId, objId);
        return { oldBbox: object.bbox };
      }
    },

    // IN GENERAL - move towards refactoring all actions that are triggered by 
    // user input into their own "category" that can be tracked in undo/redo and 
    // reverted, and distinguish between "internal" actions that get dispatched
    // by middlware. Think of user actions as their own layer...

    // objectAdded
    [objectAdded.toString()]: {
      action: (action) => {
        console.log('reverting objectAdded with action: ', action);
        const imgId = action.payload.imgId;
        const objId = action.payload.newObject._id;
        return objectRemoved({ imgId, objId });
      },
    },

    // objectRemoved
    [objectRemoved.toString()]: {
      action: (action, { bbox }) => {
        console.log('reverting objectRemoved with action: ', action);
        return objectAdded({ bbox, imgId: action.payload.imgId });
      },
      createArgs: (state, action) => { 
        const { imgId, objId } = action.payload;
        const workingImages = selectWorkingImages(state);
        const object = findObject(workingImages, imgId, objId )
        return { bbox: object.bbox };
      }
    },

    // labelAdded
    [labelAdded.toString()]: {
      action: (action) => {
        console.log('reverting labelAdded with action: ', action);
        return labelRemoved(action.payload);
      },
    },

    // labelValidated
    [labelValidated.toString()]: {
      action: (action, { oldValidation, oldLocked }) => {
        console.log("reverting labelValidated with action: ", action);
        const { imgId, objId, lblId } = action.payload;
        return labelValidationReverted({
          imgId,
          objId,
          lblId,
          oldValidation,
          oldLocked,
        });
      },
      createArgs: (state, action) => {
        const workingImages = selectWorkingImages(state);
        const { imgId, objId, lblId } = action.payload;
        const object = findObject(workingImages, imgId, objId);
        const label = object.labels.find((lbl) => lbl._id === lblId);
        return {
          oldValidation: label.validation,
          oldLocked: object.locked
        }
      }
    },

    // objectManuallyUnlocked
    [objectManuallyUnlocked.toString()]: {
      action: (action) => {
        console.log("reverting objectManuallyUnlocked with action: ", action);
        const { imgId, objId } = action.payload;
        return objectLocked({ imgId, objId, locked: true });
      },
    },

    // markedEmpty
    [markedEmpty.toString()]: {
      action: (action) => {
        console.log("reverting markedEmpty with action: ", action);
        return markedEmptyReverted(action.payload);
      },
    },

  }
});