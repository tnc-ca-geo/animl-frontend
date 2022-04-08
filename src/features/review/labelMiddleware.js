
import { ObjectID } from 'bson';
import { selectAvailLabels, fetchLabels } from '../filters/filtersSlice';
import { addLabelEnd, selectReviewMode } from '../loupe/loupeSlice';
import { editLabel } from '../images/imagesSlice';
import {
  setFocus,
  objectLocked,
  labelAdded,
  labelRemoved,
  labelValidated,
  incrementFocusIndex,
  selectWorkingImages,
  labelValidationReverted,
} from './reviewSlice';
import { findObject } from '../../app/utils';

export const labelMiddleware = store => next => action => {

  /* 
   * labelAdded
   */

  if (labelAdded.match(action)) {
    console.log('labelMiddleware.labelAdded(): ', action.payload);
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
      console.log('NOTE: object isTemp, so creating object + label');
      store.dispatch(editLabel('create', 'object', {
        object: action.payload.newObject,
        imageId: imgId,
      }));
    }
    else {
      console.log('NOTE: object exists, so just creating label');
      store.dispatch(editLabel('create', 'label', {
        labels: [action.payload.newLabel],
        imageId: imgId,
        objectId: objId,
      }));
      store.dispatch(objectLocked({ imgId, objId, locked: true }));
    }

    store.dispatch(addLabelEnd());
    const newIndex = objIsTemp ? { object: 0, label: 0 } : { label: 0 };
    store.dispatch(setFocus({ index: newIndex, type: 'auto' }));
    const reviewMode = selectReviewMode(store.getState());
    if (reviewMode) store.dispatch(incrementFocusIndex('increment'));

    // TODO: no longer have a fetchLabels query handler in API 
    // (we're fetching labels as a field level resolver for Project)
    // so we either need to to refetch this entire project, or rewirte a 
    // fetchLabels(projectId) handler again and insert them into the project slice

    // const availLabels = selectAvailLabels(store.getState());
    // const newCategoryAdded = !availLabels.ids.includes(
    //   action.payload.newLabel.category
    // );
    // if (newCategoryAdded) console.log('NOTE: new category detected, so fetching labels')  
    // if (newCategoryAdded) store.dispatch(fetchLabels());
    
    // TODO: also dispatch fetchLabels after label invalidations?
  }

  /* 
   * labelRemoved
   */

  else if (labelRemoved.match(action)) {
    console.log('labelMiddleware.labelRemoved(): ', action.payload);
    const { imgId, objId, newLabel } = action.payload;

    // remove object if there's only one label left
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imgId, objId);
    if (object.labels.length <= 1) {
      console.log('NOTE: removing objects last label, so just deleting object')
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
      store.dispatch(objectLocked({ imgId, objId, locked: false }));
    }

    next(action);
  
    // store.dispatch(incrementFocusIndex('increment')); // increment focus?
    // store.dispatch(fetchLabels()); // fetchLabels again? 
  }

  /* 
   * labelValidated
   */

  else if (labelValidated.match(action)) {
    console.log('labelMiddleware.labelValidated() - ', action);
    const { userId, imgId, objId, lblId, validated } = action.payload;
    next(action);

    // update label
    const validation = { validated, userId };
    store.dispatch(editLabel('update', 'label', {
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation },
    }));

    // update object
    const workingImages = selectWorkingImages(store.getState());
    const object = findObject(workingImages, imgId, objId);
    const allLabelsInvalidated = object.labels.every((lbl) => (
      lbl.validation && lbl.validation.validated === false
    ));
    const locked = ((!validated && allLabelsInvalidated) || validated);
    store.dispatch(objectLocked({ imgId, objId, locked}));
  }

  /* 
   * labelValidationReverted
   */

  else if (labelValidationReverted.match(action)) {
    console.log('labelMiddleware.labelValidationReverted() - ', action);
    next(action);
    const { imgId, objId, lblId, oldValidation, oldLocked } = action.payload;

    // update label
    store.dispatch(editLabel('update', 'label', {
      imageId: imgId,
      objectId: objId,
      labelId: lblId,
      diffs: { validation: oldValidation },
    }));

    // update object
    store.dispatch(objectLocked({ imgId, objId, locked: oldLocked }));
  }

  else {
    next(action);
  }

};