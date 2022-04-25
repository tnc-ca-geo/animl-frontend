import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from './IconButton';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastViewport
} from './Toast';
import {
  selectLabelsErrors,
  dismissLabelsError,
} from '../features/review/reviewSlice';
import { 
  selectProjectsErrors,
  dismissProjectsError,
  selectViewsErrors,
  dismissViewsError,
  selectDeploymentsErrors,
  dismissDeploymentsError,
  selectModelsErrors,
  dismissModelsError,
} from '../features/projects/projectsSlice';
import {
  selectCamerasErrors,
  dismissCamerasError,
} from '../features/cameras/camerasSlice';
import {
  selectImageContextErrors,
  dismissImageContextError 
} from '../features/images/imagesSlice';
import getErrorContent from '../content/Errors';


const ErrorAlerts = () => {
  const dispatch = useDispatch();
  const labelsErrors = useSelector(selectLabelsErrors);
  const projectsErrors = useSelector(selectProjectsErrors);
  const viewsErrors = useSelector(selectViewsErrors);
  const depsErrors = useSelector(selectDeploymentsErrors);
  const modelsErrors = useSelector(selectModelsErrors);
  const camerasErrors = useSelector(selectCamerasErrors);
  const imageContextErrors = useSelector(selectImageContextErrors);
  
  const enrichedErrors = [
    enrichErrors(labelsErrors, 'Label Error', 'labels'),
    enrichErrors(projectsErrors, 'Project Error', 'projects'),
    enrichErrors(viewsErrors, 'View Error', 'views'),
    enrichErrors(depsErrors, 'Deployment Error', 'deployments'),
    enrichErrors(modelsErrors, 'Model Error', 'models'),
    enrichErrors(camerasErrors, 'Camera Error', 'cameras'),
    enrichErrors(imageContextErrors, 'Image Error', 'imageContext')
  ];

  const errors = enrichedErrors.reduce((acc, curr) => (
    (curr && curr.length) ? acc.concat(curr) : acc
  ), []);

  const [open, setOpen] = useState(errors && errors.length);
  useEffect(() => {
    setOpen(errors && errors.length);
  }, [setOpen, errors]);

  const handleDismissError = (index, entity) => {
    dispatch(dismissErrorActions[entity](index));
  };

  return (
    <>
      {errors && errors.map((err, i) => (
        <Toast
          key={i}
          open={open}
          duration={60000}
          onOpenChange={(e) => {
            if (!errors) setOpen(e);
          }}
        >
          <ToastTitle variant="red">{err.title}</ToastTitle>
          <ToastDescription asChild>
            <div>{err.usrMsg}</div>
          </ToastDescription>
          <ToastAction asChild altText="Dismiss">
            <IconButton 
              variant='ghost'
              onClick={() => handleDismissError(err.index, err.entity)}
            >
              <FontAwesomeIcon icon={['fas', 'times']}/>
            </IconButton>
          </ToastAction>
        </Toast>
      ))}
      <ToastViewport />
    </>
  );
};

const dismissErrorActions = {
  'labels': (i) => dismissLabelsError(i),
  'projects': (i) => dismissProjectsError(i),
  'views': (i) => dismissViewsError(i),
  'deployments': (i) => dismissDeploymentsError(i),
  'models': (i) => dismissModelsError(i),
  'cameras': (i) => dismissCamerasError(i),
  'imageContext': (i) => dismissImageContextError(i),
};

function enrichErrors(errors, title, entity) {
  if (!errors) return;
  return errors.map((err, index) => ({
    index,
    entity,
    title: title,
    msg: err.message,
    code: err.extensions.code,
    usrMsg: getErrorContent(err),
  }));
}


export default ErrorAlerts;
