
import { ObjectID } from 'bson';
// import { selectAvailLabels, fetchLabels } from '../filters/filtersSlice';
import { addLabelEnd, selectReviewMode } from '../loupe/loupeSlice';
import {
  setFocus,
  editLabel,
  objectsLocked,
  labelAdded,
  labelRemoved,
  labelsValidated,
  incrementFocusIndex,
  selectWorkingImages,
  labelsValidationReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const labelMiddleware = store => next => action => {

  /* labelAdded */

  if (labelAdded.match(action)) {
    const { newLabel, bbox, userId, category } = action.payload;
    const { objIsTemp, imgId, objId, newObject } = action.payload;

    // if we are redoing a previous labelAdded action, 
    // there will already be a newLabel in the payload 
    action.payload.newLabel = newLabel || {
      _id: new ObjectID().toString(),
      category,
      bbox,
      validation: { validated: true, userId },  
      type: 'manual',
      conf: 1,
      userId: userId
    };

    if (objIsTemp) {
      action.payload.newObject = newObject || {
        _id: objId,
        bbox,
        locked: true,
        labels: [action.payload.newLabel],
      };
    }

    next(action);

    if (objIsTemp) {
      store.dispatch(editLabel('create', 'objects', {
        objects: [{
          object: action.payload.newObject,
          imageId: imgId,
        }]
      }));
    }
    else {
      store.dispatch(editLabel('create', 'label', {
        labels: [action.payload.newLabel],
        imageId: imgId,
        objectId: objId,
      }));
      const objects = [{ imgId, objId, locked: true }];
      store.dispatch(objectsLocked({ objects }));
    }

    store.dispatch(addLabelEnd());
    const newIndex = objIsTemp ? { object: 0, label: 0 } : { label: 0 };
    store.dispatch(setFocus({ index: newIndex, type: 'auto' }));
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) store.dispatch(incrementFocusIndex('increment'));

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

  /* labelRemoved */

  else if (labelRemoved.match(action)) {
    const { imgId, objId, newLabel } = action.payload;

    // remove object if there's only one label left
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imgId, objId);
    if (object.labels.length <= 1) {
      store.dispatch(editLabel('delete', 'object', {
        imageId: imgId,
        objectId: objId,
      }));
    }
    else {
      store.dispatch(editLabel('delete', 'label', {
        imageId: imgId,
        objectId: objId,
        labelId: newLabel._id,
      }));
      const objects = [{ imgId, objId, locked: false }];
      store.dispatch(objectsLocked({ objects }));
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