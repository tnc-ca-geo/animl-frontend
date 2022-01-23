import { createUndoMiddleware } from 'redux-undo-redo';
import {
  bboxUpdated,
  labelAdded,
  objectLocked,
  objectManuallyUnlocked,
  labelValidated,
  labelValidationReverted,
  selectWorkingImages,
  labelRemoved,
  markedEmpty,
  markedEmptyReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const undoMiddleware = createUndoMiddleware({
  revertingActions: {

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

    // bboxUpdated
    [bboxUpdated.toString()]: {
      action: (action, { oldBbox }) => {
        console.log("reverting bboxUpdated with action: ", action);
        return bboxUpdated({
          imgId: action.payload.imgId,
          objId: action.payload.objId,
          bbox: oldBbox
        })
      },
      createArgs: (state, action) => { 
        const workingImages = selectWorkingImages(state);
        const { imgId, objId } = action.payload;
        const object = findObject(workingImages, imgId, objId);
        return { oldBbox: object.bbox };
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