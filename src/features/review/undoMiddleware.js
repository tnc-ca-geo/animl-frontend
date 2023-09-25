import { createUndoMiddleware } from 'redux-undo-redo';
import {
  bboxUpdated,
  labelAdded,
  objectsLocked,
  objectManuallyUnlocked,
  labelsValidated,
  labelsValidationReverted,
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

    // labelsValidated
    [labelsValidated.toString()]: {
      action: (action, oldLabelsState) => {
        console.log("reverting labelsValidated with action: ", action);
        const labels = oldLabelsState.map(({ oldValidation, oldLocked }, i) => {
          const { imgId, objId, lblId } = action.payload.labels[i];
          return {
            imgId,
            objId,
            lblId,
            oldValidation,
            oldLocked
          };
        })
        return labelsValidationReverted({ labels });
      },
      createArgs: (state, action) => {
        console.log('undoMiddleware - labelsValidated - createArgs - action ', action);
        const workingImages = selectWorkingImages(state);
        const oldLabelsState = action.payload.labels.map(({ imgId, objId, lblId }) => {
          const object = findObject(workingImages, imgId, objId);
          const label = object.labels.find((lbl) => lbl._id === lblId);
          return { oldValidation: label.validation, oldLocked: object.locked };
        });
        return oldLabelsState;
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
        const objects = [{ imgId, objId, locked: true }]
        return objectsLocked({ objects });
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