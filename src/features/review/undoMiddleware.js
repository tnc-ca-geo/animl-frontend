import { createUndoMiddleware } from 'redux-undo-redo';
import {
  bboxUpdated,
  labelsAdded,
  objectsLocked,
  objectsManuallyUnlocked,
  labelsValidated,
  labelsValidationReverted,
  selectWorkingImages,
  labelsRemoved,
  markedEmpty,
  markedEmptyReverted,
  tagsAdded,
  tagsRemoved,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const undoMiddleware = createUndoMiddleware({
  revertingActions: {
    // labelsAdded
    [labelsAdded.toString()]: {
      action: (action) => {
        return labelsRemoved(action.payload);
      },
    },

    // labelsValidated
    [labelsValidated.toString()]: {
      action: (action, oldLabelsState) => {
        const labels = oldLabelsState.map(({ oldValidation, oldLocked }, i) => {
          const { imgId, objId, lblId } = action.payload.labels[i];
          return {
            imgId,
            objId,
            lblId,
            oldValidation,
            oldLocked,
          };
        });
        return labelsValidationReverted({ labels });
      },
      createArgs: (state, action) => {
        const workingImages = selectWorkingImages(state);
        const oldLabelsState = action.payload.labels.map(({ imgId, objId, lblId }) => {
          const object = findObject(workingImages, imgId, objId);
          const label = object.labels.find((lbl) => lbl._id === lblId);
          return { oldValidation: label.validation, oldLocked: object.locked };
        });
        return oldLabelsState;
      },
    },

    // bboxUpdated
    [bboxUpdated.toString()]: {
      action: (action, { oldBbox }) => {
        return bboxUpdated({
          imgId: action.payload.imgId,
          objId: action.payload.objId,
          bbox: oldBbox,
        });
      },
      createArgs: (state, action) => {
        const workingImages = selectWorkingImages(state);
        const { imgId, objId } = action.payload;
        const object = findObject(workingImages, imgId, objId);
        return { oldBbox: object.bbox };
      },
    },

    // objectsManuallyUnlocked
    [objectsManuallyUnlocked.toString()]: {
      action: (action) => {
        const objects = action.payload.objects.map(({ imgId, objId }) => ({
          imgId,
          objId,
          locked: true,
        }));
        return objectsLocked({ objects });
      },
    },

    // markedEmpty
    [markedEmpty.toString()]: {
      action: (action) => {
        return markedEmptyReverted(action.payload);
      },
    },

    // tagsAdded
    [tagsAdded.toString()]: {
      action: (action) => {
        return tagsRemoved(action.payload);
      },
    },
  },
});
