
import { ObjectID } from 'bson';
import {
  editLabel,
  bboxUpdated,
  objectRemoved,
  objectsLocked,
  objectManuallyUnlocked,
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

 /* objectRemoved */

  else if (objectRemoved.match(action)) {
    const { imgId, objId } = action.payload;
    store.dispatch(editLabel('delete', 'objects', {
      imageId: imgId,
      objectId: objId,
    }));
    next(action);
  }

  /* objectsLocked */

  else if (objectsLocked.match(action)) {
    console.log('objectMiddleware - objectsLoked - action: ', action);
    next(action);
    const updates = action.payload.objects.map(({ imgId, objId, locked }) => ({
      imageId: imgId,
      objectId: objId,
      diffs: { locked },
    }))
    store.dispatch(editLabel('update', 'objects', { updates }));
  }

  /* objectManuallyUnlocked */

  else if (objectManuallyUnlocked.match(action)) {
    next(action);
    const { imgId, objId } = action.payload;
    const objects = [{ imgId, objId, locked: false }];
    store.dispatch(objectsLocked({ objects }));
  }

  /* markedEmpty */

  else if (markedEmpty.match(action)) {
    const { imgId, userId } = action.payload;

    action.payload.newObject = action.payload.newObject || {
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

    next(action);
    store.dispatch(editLabel('create', 'object', {
      object: action.payload.newObject,
      imageId: imgId,
    }));
  }

  /* markedEmpty */

  else if (markedEmptyReverted.match(action)) {
    const { imgId, newObject } = action.payload;
    if (newObject) {
      store.dispatch(objectRemoved({ imgId, objId: newObject._id }));
    }
  }

  else {
    next(action);
  }

};