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
  selectTagsErrors,
  dismissTagsError,
} from '../features/review/reviewSlice';
import {
  selectProjectsErrors,
  dismissProjectsError,
  selectViewsErrors,
  dismissViewsError,
  selectModelsErrors,
  dismissModelsError,
  selectCreateProjectsErrors,
  dismissCreateProjectError,
  selectManageLabelsErrors,
  dismissManageLabelsError,
  selectProjectTagErrors,
  dismissProjectTagErrors,
} from '../features/projects/projectsSlice';
import {
  selectWirelessCamerasErrors,
  dismissWirelessCamerasError,
} from '../features/cameras/wirelessCamerasSlice';
import {
  selectImagesErrors,
  dismissImagesError,
  selectImageContextErrors,
  dismissImageContextError,
} from '../features/images/imagesSlice';
import {
  selectStatsErrors,
  dismissStatsError,
  selectExportAnnotationsErrors,
  dismissExportError,
  selectErrorsExportErrors,
  dismissErrorsExportError,
  selectDeploymentsErrors,
  dismissDeploymentsError,
  selectCameraSerialNumberErrors,
  dismissCameraSerialNumberError,
  selectDeleteCameraErrors,
  dismissDeleteCameraError,
  selectDeleteImagesErrors,
  dismissDeleteImagesError,
  selectDeleteProjectLabelErrors,
  dismissDeleteProjectLabelTaskError,
} from '../features/tasks/tasksSlice';
import {
  selectRedriveBatchErrors,
  dismissRedriveBatchError,
  selectUploadErrors,
  dismissUploadError,
} from '../features/upload/uploadSlice';
import getErrorContent from '../content/Errors';
import { selectManageUserErrors, dismissManageUsersError } from '../features/projects/usersSlice';

// TODO: add updateAutomationRules errors

const ErrorToast = () => {
  const dispatch = useDispatch();
  const labelsErrors = useSelector(selectLabelsErrors);
  const tagsErrors = useSelector(selectTagsErrors);
  const commentsErrors = useSelector(selectCommentsErrors);
  const projectsErrors = useSelector(selectProjectsErrors);
  const viewsErrors = useSelector(selectViewsErrors);
  const depsErrors = useSelector(selectDeploymentsErrors);
  const modelsErrors = useSelector(selectModelsErrors);
  const camerasErrors = useSelector(selectWirelessCamerasErrors);
  const imagesErrors = useSelector(selectImagesErrors);
  const imageContextErrors = useSelector(selectImageContextErrors);
  const statsErrors = useSelector(selectStatsErrors);
  const exportAnnotationsErrors = useSelector(selectExportAnnotationsErrors);
  const exportImageErrorsErrors = useSelector(selectErrorsExportErrors);
  const redriveBatchErrors = useSelector(selectRedriveBatchErrors);
  const manageUserErrors = useSelector(selectManageUserErrors);
  const createProjectErrors = useSelector(selectCreateProjectsErrors);
  const manageLabelsErrors = useSelector(selectManageLabelsErrors);
  const uploadErrors = useSelector(selectUploadErrors);
  const cameraSerialNumberErrors = useSelector(selectCameraSerialNumberErrors);
  const deleteCameraErrors = useSelector(selectDeleteCameraErrors);
  const projectTagErrors = useSelector(selectProjectTagErrors);
  const deleteImagesErrors = useSelector(selectDeleteImagesErrors);
  const deleteProjectLabelErrors = useSelector(selectDeleteProjectLabelErrors);

  const enrichedErrors = [
    enrichErrors(labelsErrors, 'Label Error', 'labels'),
    enrichErrors(tagsErrors, 'Tag Error', 'tags'),
    enrichErrors(projectTagErrors, 'Tag Error', 'projectTags'),
    enrichErrors(commentsErrors, 'Comment Error', 'comments'),
    enrichErrors(projectsErrors, 'Project Error', 'projects'),
    enrichErrors(viewsErrors, 'View Error', 'views'),
    enrichErrors(depsErrors, 'Deployment Error', 'deployments'),
    enrichErrors(modelsErrors, 'Model Error', 'models'),
    enrichErrors(camerasErrors, 'Camera Error', 'cameras'),
    enrichErrors(imagesErrors, 'Image Error', 'images'),
    enrichErrors(imageContextErrors, 'Image Error', 'imageContext'),
    enrichErrors(statsErrors, 'Error Getting Stats', 'stats'),
    enrichErrors(exportAnnotationsErrors, 'Error Exporting Data', 'data'),
    enrichErrors(exportImageErrorsErrors, 'Error Downloading Errors CSV', 'uploadImageErrors'),
    enrichErrors(redriveBatchErrors, 'Error Retrying Failed Images in Batch', 'redriveBatch'),
    enrichErrors(manageUserErrors, 'Manage User Error', 'manageUsers'),
    enrichErrors(createProjectErrors, 'Error Creating Project', 'createProject'),
    enrichErrors(manageLabelsErrors, 'Error Updating Label', 'manageLabels'),
    enrichErrors(uploadErrors, 'Error Uploading Images', 'upload'),
    enrichErrors(
      cameraSerialNumberErrors,
      'Error Updating Camera Serial Number',
      'cameraSerialNumber',
    ),
    enrichErrors(deleteCameraErrors, 'Error Deleting Camera', 'deleteCamera'),
    enrichErrors(deleteImagesErrors, 'Error Deleting Images', 'deleteImages'),
    enrichErrors(deleteProjectLabelErrors, 'Error Deleting Label', 'deleteProjectLabel'),
  ];

  const errors = enrichedErrors.reduce(
    (acc, curr) => (curr && curr.length ? acc.concat(curr) : acc),
    [],
  );

  // this should be revisited as per: https://github.com/tnc-ca-geo/animl-frontend/issues/411
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
  tags: (i) => dismissTagsError(i),
  projectTags: (i) => dismissProjectTagErrors(i),
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
  uploadImageErrors: (i) => dismissErrorsExportError(i),
  redriveBatch: (i) => dismissRedriveBatchError(i),
  manageUsers: (i) => dismissManageUsersError(i),
  manageLabels: (i) => dismissManageLabelsError(i),
  upload: (i) => dismissUploadError(i),
  cameraSerialNumber: (i) => dismissCameraSerialNumberError(i),
  deleteCamera: (i) => dismissDeleteCameraError(i),
  deleteImages: (i) => dismissDeleteImagesError(i),
  deleteProjectLabel: (i) => dismissDeleteProjectLabelTaskError(i),
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

export default ErrorToast;
