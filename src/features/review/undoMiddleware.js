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
} from './reviewSlice';

export const undoMiddleware = createUndoMiddleware({
  revertingActions: {

    // setFocus
    [setFocus.toString()]: {
      action: (action, { oldFocus }) => (
        setFocus({ index: oldFocus, type: action.payload.type })
      ),
      createArgs: (state, action) => ({ oldFocus: selectFocusIndex(state) })
    },

    // bboxUpdated
    [bboxUpdated.toString()]: {
      action: (action, { oldBbox }) => ( 
        // NOTE: this could be buggy b/c the objectIndex could have potentially
        // changed?? Or maybe not becuase you'd have to undo all the following edits,
        // including any adding of new objects, in order to get back to this one?
        bboxUpdated({
          imageIndex: action.payload.imageIndex,
          objectIndex: action.payload.objectIndex,
          bbox: oldBbox
        })
      ),
      createArgs: (state, action) => { 
        const workingImages = selectWorkingImages(state);
        const img = workingImages[action.payload.imageIndex];
        const object = img.objects[action.payload.objectIndex];
        return { oldBbox: object.bbox };
      }
    },

    // // objectAdded
    // [objectAdded.toString()]: {
    //   action: (action, { img }) => {
    //     console.log('reverting objectAdded with action: ', action);
    //     const objectIndex = img.objects.findIndex((obj) => (
    //       obj._id.toString() === action.payload.newObject._id.toString()
    //     ));
    //     console.log('object index with action: ', objectIndex);
    //     return objectRemoved({
    //       imageIndex: action.payload.imageIndex,
    //       objectIndex
    //     });
    //   },
    //   createArgs: (state, action) => { 
    //     const workingImages = selectWorkingImages(state);
    //     return { img: workingImages[action.payload.imageIndex] };
    //   }
    // },

    // // objectRemoved
    // [objectRemoved.toString()]: {
    //   action: (action, { bbox }) => {
    //     console.log('reverting objectRemoved with action: ', action);
    //     return objectAdded({ bbox, imageIndex: action.payload.imageIndex });
    //   },
    //   createArgs: (state, action) => { 
    //     const workingImages = selectWorkingImages(state);
    //     const img = workingImages[action.payload.imageIndex];
    //     const object = img.objects[action.payload.objectIndex];
    //     return { bbox: object.bbox };
    //   }
    // },

    // labelAdded
    [labelAdded.toString()]: {
      action: (action) => {
        console.log("reverting labelAdded with action: ", action);
        return labelRemoved({ index: action.payload.index });
      },
    },

    // labelValidated
    [labelValidated.toString()]: {
      action: (action, { oldValidation, oldLocked }) => {
        console.log("reverting labelValidated with action: ", action);
        return labelValidationReverted({
          index: action.payload.index,
          oldValidation,
          oldLocked,
        });
      },
      createArgs: (state, action) => {
        const workingImages = selectWorkingImages(state);
        const i = action.payload.index;
        const object = workingImages[i.image].objects[i.object];
        const label = object.labels[i.label];
        return {
          oldValidation: label.validation,
          oldLocked: object.locked
        }
      }
    },

    // objectLocked
    [objectManuallyUnlocked.toString()]: {
      action: (action) => {
        console.log("reverting objectManuallyUnlocked with action: ", action);
        return objectLocked({
          index: action.payload.index,
          locked: true
        });
      },
    },

    // markedEmpty

  }
});