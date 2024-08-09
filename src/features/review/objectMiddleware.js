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

export const objectMiddleware = (store) => (next) => (action) => {
  /* bboxUpdated */
  if (bboxUpdated.match(action)) {
    next(action);
    const { imgId, objId, bbox } = action.payload;
    store.dispatch(
      editLabel('update', 'objects', {
        updates: [
          {
            imageId: imgId,
            objectId: objId,
            diffs: { bbox },
          },
        ],
      }),
    );
  } else if (objectsRemoved.match(action)) {
    /* objectsRemoved */
    store.dispatch(
      editLabel('delete', 'objects', {
        objects: action.payload.objects.map(({ imgId, objId }) => ({
          imageId: imgId,
          objectId: objId,
        })),
      }),
    );
    next(action);
  } else if (objectsLocked.match(action)) {
    /* objectsLocked */
    next(action);
    const updates = action.payload.objects.map(({ imgId, objId, locked }) => ({
      imageId: imgId,
      objectId: objId,
      diffs: { locked },
    }));
    store.dispatch(editLabel('update', 'objects', { updates }));
  } else if (objectsManuallyUnlocked.match(action)) {
    /* objectsManuallyUnlocked */
    next(action);
    const objects = action.payload.objects.map(({ imgId, objId }) => ({
      imgId,
      objId,
      locked: false,
    }));
    store.dispatch(objectsLocked({ objects }));
  } else if (markedEmpty.match(action)) {
    /* markedEmpty */
    const { images, userId } = action.payload;

    action.payload.images = images.map((img) => {
      img.newObject = img.newObject || {
        _id: new ObjectID().toString(),
        bbox: [0, 0, 1, 1],
        locked: true,
        labels: [
          {
            _id: new ObjectID().toString(),
            imageId: img.imgId,
            labelId: 'empty',
            bbox: [0, 0, 1, 1],
            validation: { validated: true, userId },
            conf: 1,
            userId,
          },
        ],
      };
      return img;
    });

    next(action);

    store.dispatch(
      editLabel('create', 'objects', {
        objects: action.payload.images.map(({ newObject, imgId }) => ({
          object: newObject,
          imageId: imgId,
        })),
      }),
    );
  } else if (markedEmptyReverted.match(action)) {
    /* markedEmptyReverted */
    const objectsToRemove = [];
    for (const { imgId, newObject } of action.payload.images) {
      if (newObject) {
        // TODO: not sure this is necessary - is there ever a case where there is not a newObject?
        objectsToRemove.push({ imgId, objId: newObject._id });
      }
    }
    if (objectsToRemove.length) {
      store.dispatch(objectsRemoved({ objects: objectsToRemove }));
    }
  } else {
    next(action);
  }
};
