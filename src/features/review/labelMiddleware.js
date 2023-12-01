
import { ObjectID } from 'bson';
// import { selectAvailLabels, fetchLabels } from '../filters/filtersSlice';
import { addLabelEnd, selectReviewMode } from '../loupe/loupeSlice';
import {
  setFocus,
  editLabel,
  objectsLocked,
  labelsAdded,
  labelsRemoved,
  labelsValidated,
  incrementFocusIndex,
  selectWorkingImages,
  labelsValidationReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const labelMiddleware = store => next => action => {

  /* labelsAdded */

  if (labelsAdded.match(action)) {

    action.payload.labels.map((label) => {
      const { newLabel, bbox, userId, category } = label;
      const { objIsTemp, imgId, objId, newObject } = label;
      // if we are redoing a previous labelsAdded action, 
      // there will already be a newLabel in the payload 
      label.newLabel = newLabel || {
        _id: new ObjectID().toString(),
        category,
        bbox,
        validation: { validated: true, userId },  
        type: 'manual',
        conf: 1,
        userId: userId
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

    const tempObjs = action.payload.labels.filter((lbl) => lbl.objIsTemp );
    const nonTempObjs = action.payload.labels.filter((lbl) => !lbl.objIsTemp );

    if (tempObjs.length) {
      store.dispatch(editLabel('create', 'objects', {
        objects: tempObjs.map(({ newObject, imgId }) => ({
          object: newObject,
          imageId: imgId
        }))
      }));
    }

    if (nonTempObjs.length) {
      store.dispatch(editLabel('create', 'labels', {
        labels: nonTempObjs.map(({ newLabel, imgId, objId }) => ({
          ...newLabel,
          imageId: imgId,
          objectId: objId
        }))
      }));

      store.dispatch(objectsLocked({
        objects: nonTempObjs.map(({ imgId, objId }) => ({
          imgId,
          objId,
          locked: true
        }))
      }));
    }

    store.dispatch(addLabelEnd());

    // TODO: not sure what to do about this now that we're supporting adding
    // multiple labels at once:

    // const newIndex = objIsTemp ? { object: 0, label: 0 } : { label: 0 };
    // store.dispatch(setFocus({ index: newIndex, type: 'auto' }));
    // const reviewMode = selectReviewMode(store.getState());
    // if (reviewMode) store.dispatch(incrementFocusIndex('increment'));

    // TODO: no longer have a fetchLabels query handler in API 
    // (we're fetching labels as a field level resolver for Project)
    // so we either need to to refetch this entire project, or rewrite a 
    // fetchLabels(projectId) handler again and insert them into the project slice

    // const availLabels = selectAvailLabels(store.getState());
    // const newCategoryAdded = !availLabels.ids.includes(
    //   action.payload.newLabel.category
    // );
    // if (newCategoryAdded) console.log('NOTE: new category detected, so fetching labels')  
    // if (newCategoryAdded) store.dispatch(fetchLabels());
    
    // TODO: also dispatch fetchLabels after label invalidations?
  }

  /* labelsRemoved */

  else if (labelsRemoved.match(action)) {

    for (const { imgId, objId, newLabel } of action.payload.labels) {
      // remove object if there's only one label left
      const workingImages = selectWorkingImages(store.getState());
      const object = findObject(workingImages, imgId, objId);
      if (object.labels.length <= 1) {
        store.dispatch(editLabel('delete', 'objects', {
          objects: [{
            imageId: imgId,
            objectId: objId,
          }]
        }));
      }
      else {
        store.dispatch(editLabel('delete', 'labels', {
          labels: [{
            imageId: imgId,
            objectId: objId,
            labelId: newLabel._id
          }]
        }));
        const objects = [{ imgId, objId, locked: false }];
        store.dispatch(objectsLocked({ objects }));
      }
    }

    next(action);
  
    // store.dispatch(incrementFocusIndex('increment')); // increment focus?
    // store.dispatch(fetchLabels()); // fetchLabels again? 
  }

  /* labelsValidated */

  else if (labelsValidated.match(action)) {
    console.log('labelMiddleware - labelsValidated - action: ', action);
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
      const allLabelsInvalidated = object.labels.every((lbl) => (
        lbl.validation && lbl.validation.validated === false
      ));
      const locked = (!validated && allLabelsInvalidated) || validated;
      objects.push({ imgId, objId, locked })
    });
    store.dispatch(objectsLocked({ objects }));
  }

  /* labelsValidationReverted */

  else if (labelsValidationReverted.match(action)) {
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
      locked: oldLocked 
    }));
    store.dispatch(objectsLocked({ objects: objectUpdates }));
  }

  else {
    next(action);
  }

};