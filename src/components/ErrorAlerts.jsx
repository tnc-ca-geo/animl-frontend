import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cross2Icon } from '@radix-ui/react-icons';
import IconButton from './IconButton';
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastViewport } from './Toast';
import {
  selectLabelsErrors,
  dismissLabelsError,
  selectCommentsErrors,
  dismissCommentsError,
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
  selectCreateProjectsErrors,
  dismissCreateProjectError,
  selectManageLabelsErrors,
  dismissManageLabelsError,
} from '../features/projects/projectsSlice';
import { selectWirelessCamerasErrors, dismissWirelessCamerasError } from '../features/cameras/wirelessCamerasSlice';
import {
  selectImagesErrors,
  dismissImagesError,
  selectImageContextErrors,
  dismissImageContextError,
  selectExportDataErrors,
  dismissExportError,
} from '../features/images/imagesSlice';
import { selectStatsErrors, dismissStatsError } from '../features/tasks/tasksSlice';
import {
  selectExportImageErrorsErrors,
  dismissExportErrorsError,
  selectRedriveBatchErrors,
  dismissRedriveBatchError,
  selectUploadErrors,
  dismissUploadError,
} from '../features/upload/uploadSlice';
import getErrorContent from '../content/Errors';
import { selectManageUserErrors, dismissManageUsersError } from '../features/projects/usersSlice';

// TODO: add updateAutomationRules errors

const ErrorAlerts = () => {
  const dispatch = useDispatch();
  const labelsErrors = useSelector(selectLabelsErrors);
  const commentsErrors = useSelector(selectCommentsErrors);
  const projectsErrors = useSelector(selectProjectsErrors);
  const viewsErrors = useSelector(selectViewsErrors);
  const depsErrors = useSelector(selectDeploymentsErrors);
  const modelsErrors = useSelector(selectModelsErrors);
  const camerasErrors = useSelector(selectWirelessCamerasErrors);
  const imagesErrors = useSelector(selectImagesErrors);
  const imageContextErrors = useSelector(selectImageContextErrors);
  const statsErrors = useSelector(selectStatsErrors);
  const exportDataErrors = useSelector(selectExportDataErrors);
  const exportImageErrorsErrors = useSelector(selectExportImageErrorsErrors);
  const redriveBatchErrors = useSelector(selectRedriveBatchErrors);
  const manageUserErrors = useSelector(selectManageUserErrors);
  const createProjectErrors = useSelector(selectCreateProjectsErrors);
  const manageLabelsErrors = useSelector(selectManageLabelsErrors);
  const uploadErrors = useSelector(selectUploadErrors);

  const enrichedErrors = [
    enrichErrors(labelsErrors, 'Label Error', 'labels'),
    enrichErrors(commentsErrors, 'Comment Error', 'comments'),
    enrichErrors(projectsErrors, 'Project Error', 'projects'),
    enrichErrors(viewsErrors, 'View Error', 'views'),
    enrichErrors(depsErrors, 'Deployment Error', 'deployments'),
    enrichErrors(modelsErrors, 'Model Error', 'models'),
    enrichErrors(camerasErrors, 'Camera Error', 'cameras'),
    enrichErrors(imagesErrors, 'Image Error', 'images'),
    enrichErrors(imageContextErrors, 'Image Error', 'imageContext'),
    enrichErrors(statsErrors, 'Error Getting Stats', 'stats'),
    enrichErrors(exportDataErrors, 'Error Exporting Data', 'data'),
    enrichErrors(exportImageErrorsErrors, 'Error Downloading Errors CSV', 'uploadImageErrors'),
    enrichErrors(redriveBatchErrors, 'Error Retrying Failed Images in Batch', 'redriveBatch'),
    enrichErrors(manageUserErrors, 'Manage User Error', 'manageUsers'),
    enrichErrors(createProjectErrors, 'Error Creating Project', 'createProject'),
    enrichErrors(manageLabelsErrors, 'Error Updating Label', 'manageLabels'),
    enrichErrors(uploadErrors, 'Error Uploading Images', 'upload'),
  ];

  const errors = enrichedErrors.reduce((acc, curr) => (curr && curr.length ? acc.concat(curr) : acc), []);

  const [open, setOpen] = useState(errors && errors.length);
  useEffect(() => {
    setOpen(errors && errors.length);
  }, [setOpen, errors]);

  const handleDismissError = (index, entity) => {
    dispatch(dismissErrorActions[entity](index));
  };

  return (
    <>
      {errors &&
        errors.map((err, i) => (
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
              <IconButton variant="ghost" onClick={() => handleDismissError(err.index, err.entity)}>
                <Cross2Icon />
              </IconButton>
            </ToastAction>
          </Toast>
        ))}
      <ToastViewport />
    </>
  );
};

const dismissErrorActions = {
  labels: (i) => dismissLabelsError(i),
  comments: (i) => dismissCommentsError(i),
  projects: (i) => dismissProjectsError(i),
  createProject: (i) => dismissCreateProjectError(i),
  views: (i) => dismissViewsError(i),
  deployments: (i) => dismissDeploymentsError(i),
  models: (i) => dismissModelsError(i),
  cameras: (i) => dismissWirelessCamerasError(i),
  images: (i) => dismissImagesError(i),
  imageContext: (i) => dismissImageContextError(i),
  stats: (i) => dismissStatsError(i),
  data: (i) => dismissExportError(i),
  uploadImageErrors: (i) => dismissExportErrorsError(i),
  redriveBatch: (i) => dismissRedriveBatchError(i),
  manageUsers: (i) => dismissManageUsersError(i),
  manageLabels: (i) => dismissManageLabelsError(i),
  upload: (i) => dismissUploadError(i),
};

function enrichErrors(errors, title, entity) {
  // console.log(`${entity} errors: `, errors);
  if (!errors || !errors.length) return;
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
