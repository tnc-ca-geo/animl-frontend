
import { ObjectID } from 'bson';
import {
  editLabel,
  bboxUpdated,
  objectsRemoved,
  objectsLocked,
  objectsManuallyUnlocked,
  markedEmpty,
  markedEmptyReverted,
} from './reviewSlice';

export const objectMiddleware = store => next => action => {

  /* bboxUpdated */

  if (bboxUpdated.match(action)) {
    next(action);
    const { imgId, objId, bbox } = action.payload;
    store.dispatch(editLabel('update', 'objects', {
      updates: [{
        imageId: imgId,
        objectId: objId,
        diffs: { bbox },
      }]
    }));
  }

 /* objectsRemoved */

  else if (objectsRemoved.match(action)) {
    store.dispatch(editLabel('delete', 'objects', {
      objects: action.payload.objects.map(({ imgId, objId }) => ({
        imageId: imgId,
        objectId: objId
      }))
    }));
    next(action);
  }

  /* objectsLocked */

  else if (objectsLocked.match(action)) {
    console.log('objectMiddleware - objectsLocked - action: ', action);
    next(action);
    const updates = action.payload.objects.map(({ imgId, objId, locked }) => ({
      imageId: imgId,
      objectId: objId,
      diffs: { locked },
    }))
    store.dispatch(editLabel('update', 'objects', { updates }));
  }

  /* objectsManuallyUnlocked */

  else if (objectsManuallyUnlocked.match(action)) {
    next(action);
    console.log('objectMiddleware - objectsManuallyUnlocked: ', action.payload)
    // const { imgId, objIds } = action.payload;
    // const objects = objIds.map((objId) => ({ imgId, objId, locked: false }));
    const objects = action.payload.objects.map(({ imgId, objId }) => ({
      imgId, objId, locked: false
    }));
    store.dispatch(objectsLocked({ objects }));
  }

  /* markedEmpty */

  else if (markedEmpty.match(action)) {
    const { images, userId } = action.payload;

    action.payload.images = images.map((img) => {
      img.newObject = img.newObject || {
        _id: new ObjectID().toString(),
        bbox: [0,0,1,1],
        locked: true,
        labels: [{
          _id: new ObjectID().toString(),
          category: 'empty',
          bbox: [0,0,1,1],
          validation: { validated: true, userId },  
          type: 'manual',
          conf: 1,
          userId
        }],
      };
      return img;
    });

    next(action);

    store.dispatch(editLabel('create', 'objects', {
      objects: action.payload.images.map(({ newObject, imgId }) => ({
        object: newObject,
        imageId: imgId,
      }))
    }));
  }

  /* markedEmptyReverted */

  else if (markedEmptyReverted.match(action)) {
    const objectsToRemove = [];
    for (const { imgId, newObject } of action.payload.images) {
      if (newObject) {  // TODO: not sure this is necessary - is there ever a case where there is not a newObject?
        objectsToRemove.push({ imgId, objId: newObject._id })
      }
    }
    if (objectsToRemove.length) {
      store.dispatch(objectsRemoved({ objects: objectsToRemove }));
    }
  }

  else {
    next(action);
  }

};