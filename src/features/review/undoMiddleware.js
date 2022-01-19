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
          imageId: action.payload.imageId,
          objectId: action.payload.objectId,
          bbox: oldBbox
        })
      ),
      createArgs: (state, action) => { 
        const workingImages = selectWorkingImages(state);
        const { imageId, objectId } = action.payload;
        const object = findObject(workingImages, imageId, objectId);
        return { oldBbox: object.bbox };
      }
    },

    // Ok sensing an issue here: 
    // if we track objectAdded and labelAdded w/ undo-redo, 
    // the undo history will look like the following after adding a new object:
    //    - [0] setFocus
    //    - [1] labelAdded - now object gets its label 
    //    - [2] setFocus
    //    - [3] objectAdded - at this poing labels are empty []
    // that is an issue because if were undoing that, we remove the label first, 
    // which leaves the object haning w/ an empty label array
    // but the object has dissapeared on the front end, so it's not clear the user
    // needs to ctrl-z (twice more) to actually trigger the objectAdded reversion
    //  

    // solution ideas:
    //    - only track labelAdded on in undo-redo, and in any situation where
    //      we're removing the last label from an object, 
    //      automatically delete the object (implement on front and back end)?
    //      would we also have to do the inverse (if adding a label w/ no object, create the obect?).. ugh that feels ugly
    //    - how hold off on sending create obejct request to back end until user has added a label for it 
    //      (so no temp objects get stored to db). 
    //          - Object drawn -> create temporary object in FullSizeImage state,
    //          - labelAdded -> check if object is temporary, send bbox in payload, 
    //            middleware picks it up and if sees bbox, requests object creation, then label creation (or both together?)
    //            if no bbox, use objectId in payload just request create label like usual
    //          - UNDOING labelAdded -> if it's the last label on the object, remove object
    //            if not, just remove the label
    //          - REDOING labelAdded -> same as before

    // IN GENERAL - move towards refactoring all actions that are triggered by 
    // user input into their own "category" that can be tracked in undo/redo and 
    // reverted, and distinguish between "internal" actions that get dispatched
    // by middlware. Think of user actions as their own layer...


    // unrelated but we should also rely less on indexes and more on ids when
    // dispatching edits... i refactored objectAdded & objectRemoved to us ids
    // in payloads rather than indices but should do throughout:
    //    - labelAdded / labelRemoved (done)
    //    - labelValidated (done)
    //    - objectLocked (done)
    //    - markedEmpty (done)

    // objectAdded
    [objectAdded.toString()]: {
      action: (action) => {
        console.log('reverting objectAdded with action: ', action);
        const imageId = action.payload.imageId;
        const objectId = action.payload.newObject._id;
        return objectRemoved({ imageId, objectId });
      },
    },

    // objectRemoved
    [objectRemoved.toString()]: {
      action: (action, { bbox }) => {
        console.log('reverting objectRemoved with action: ', action);
        return objectAdded({ bbox, imageId: action.payload.imageId });
      },
      createArgs: (state, action) => { 
        const workingImages = selectWorkingImages(state);
        const objects = workingImages.find((img) => (
          img._id.toString() === action.payload.imageId.toString()
        )).objects;
        const object = objects.find((obj) => (
          obj._id.toString() === action.payload.objectId.toString()
        ));
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
        const { imageId, objectId, labelId } = action.payload;
        return labelValidationReverted({
          imageId,
          objectId,
          labelId,
          oldValidation,
          oldLocked,
        });
      },
      createArgs: (state, action) => {
        const workingImages = selectWorkingImages(state);
        const { imageId, objectId, labelId } = action.payload;
        const object = findObject(workingImages, imageId, objectId);
        const label = object.labels.filter((lbl) => (
          lbl._id.toString() === labelId.toString()
        ))[0];
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
        const { imageId, objectId } = action.payload;
        return objectLocked({ imageId, objectId, locked: true });
      },
    },

    // markedEmpty
    [markedEmpty.toString()]: {
      action: (action) => {
        console.log("reverting markedEmpty with action: ", action);
        return markedEmptyReverted(action.payload)
      },
    },

  }
});