import { ObjectID } from 'bson';
import _ from 'lodash';
import { addLabelEnd } from '../loupe/loupeSlice';
import {
  editLabel,
  objectsLocked,
  labelsAdded,
  labelsRemoved,
  labelsValidated,
  selectWorkingImages,
  labelsValidationReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const labelMiddleware = (store) => (next) => (action) => {
  /* labelsAdded */

  if (labelsAdded.match(action)) {
    action.payload.labels.map((label) => {
      const { newLabel, bbox, userId, labelId } = label;
      const { objIsTemp, objId, newObject } = label;
      // if we are redoing a previous labelsAdded action,
      // there will already be a newLabel in the payload
      label.newLabel = newLabel || {
        _id: new ObjectID().toString(),
        labelId,
        bbox,
        validation: { validated: true, userId },
        conf: 1,
        userId: userId,
      };

      if (objIsTemp) {
        label.newObject = newObject || {
          _id: objId,
          bbox,
          locked: true,
          labels: [label.newLabel],
        };
      }

      return label;
    });

    next(action);

    const tempObjs = action.payload.labels.filter((lbl) => lbl.objIsTemp);
    const nonTempObjs = action.payload.labels.filter((lbl) => !lbl.objIsTemp);

    if (tempObjs.length) {
      store.dispatch(
        editLabel('create', 'objects', {
          objects: tempObjs.map(({ newObject, imgId }) => {
            const obj = _.cloneDeep(newObject);
            obj.labels = obj.labels.map((lbl) => ({ ...lbl, imageId: imgId, objectId: obj._id }));
            return {
              object: obj,
              imageId: imgId,
            };
          }),
        }),
      );
    }

    if (nonTempObjs.length) {
      store.dispatch(
        editLabel('create', 'labels', {
          labels: nonTempObjs.map(({ newLabel, imgId, objId }) => ({
            ...newLabel,
            imageId: imgId,
            objectId: objId,
          })),
        }),
      );

      store.dispatch(
        objectsLocked({
          objects: nonTempObjs.map(({ imgId, objId }) => ({
            imgId,
            objId,
            locked: true,
          })),
        }),
      );
    }

    store.dispatch(addLabelEnd());
  } else if (labelsRemoved.match(action)) {
    /* labelsRemoved */
    for (const { imgId, objId, newLabel } of action.payload.labels) {
      // remove object if there's only one label left
      const workingImages = selectWorkingImages(store.getState());
      const object = findObject(workingImages, imgId, objId);
      if (object.labels.length <= 1) {
        store.dispatch(
          editLabel('delete', 'objects', {
            objects: [
              {
                imageId: imgId,
                objectId: objId,
              },
            ],
          }),
        );
      } else {
        store.dispatch(
          editLabel('delete', 'labels', {
            labels: [
              {
                imageId: imgId,
                objectId: objId,
                labelId: newLabel._id,
              },
            ],
          }),
        );
        const objects = [{ imgId, objId, locked: false }];
        store.dispatch(objectsLocked({ objects }));
      }
    }

    next(action);
  } else if (labelsValidated.match(action)) {
    /* labelsValidated */
    next(action);
    const lbls = action.payload.labels;

    // update labels
    const updates = lbls.map(({ userId, imgId, objId, lblId, validated }) => ({
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation: { validated, userId } },
    }));
    store.dispatch(editLabel('update', 'labels', { updates }));

    // update objects
    const workingImages = selectWorkingImages(store.getState());
    const objects = [];
    lbls.forEach(({ imgId, objId, validated }) => {
      const object = findObject(workingImages, imgId, objId);
      const allLabelsInvalidated = object.labels.every(
        (lbl) => lbl.validation && lbl.validation.validated === false,
      );
      const locked = (!validated && allLabelsInvalidated) || validated;
      objects.push({ imgId, objId, locked });
    });
    store.dispatch(objectsLocked({ objects }));
  } else if (labelsValidationReverted.match(action)) {
    /* labelsValidationReverted */
    next(action);
    const lbls = action.payload.labels;

    // update labels
    const labelUpdates = lbls.map(({ imgId, objId, lblId, oldValidation }) => ({
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation: oldValidation },
    }));
    store.dispatch(editLabel('update', 'labels', { updates: labelUpdates }));

    // update object
    const objectUpdates = lbls.map(({ imgId, objId, oldLocked }) => ({
      imgId,
      objId,
      locked: oldLocked,
    }));
    store.dispatch(objectsLocked({ objects: objectUpdates }));
  } else {
    next(action);
  }
};
