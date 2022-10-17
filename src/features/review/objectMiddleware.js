
import { ObjectID } from 'bson';
import {
  editLabel,
  bboxUpdated,
  objectRemoved,
  objectLocked,
  objectManuallyUnlocked,
  markedEmpty,
  markedEmptyReverted,
} from './reviewSlice';

export const objectMiddleware = store => next => action => {

  /* bboxUpdated */

  if (bboxUpdated.match(action)) {
    next(action);
    const { imgId, objId, bbox } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId: imgId,
      objectId: objId,
      diffs: { bbox },
    }));
  }

 /* objectRemoved */

  else if (objectRemoved.match(action)) {
    const { imgId, objId } = action.payload;
    store.dispatch(editLabel('delete', 'object', {
      imageId: imgId,
      objectId: objId,
    }));
    next(action);
  }

  /* objectLocked */

  else if (objectLocked.match(action)) {
    next(action);
    const { imgId, objId, locked } = action.payload;
    store.dispatch(editLabel('update', 'object', {
      imageId: imgId,
      objectId: objId,
      diffs: { locked },
    }));
  }

  /* objectManuallyUnlocked */

  else if (objectManuallyUnlocked.match(action)) {
    next(action);
    const { imgId, objId } = action.payload;
    store.dispatch(objectLocked({ imgId, objId, locked: false }));
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