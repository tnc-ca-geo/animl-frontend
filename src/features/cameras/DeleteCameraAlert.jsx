import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { red } from '@radix-ui/colors';
import Button from '../../components/Button.jsx';
import {
  clearDeleteCameraTask,
  deleteCamera,
  fetchTask,
  selectDeleteCameraLoading,
} from '../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { selectSelectedCamera, setSelectedCamera } from '../projects/projectsSlice.js';
import {
  fetchCameraImageCount,
  selectCameraImageCount,
  selectCameraImageCountLoading,
  clearCameraImageCount,
  selectDeleteCameraAlertStatus,
  setDeleteCameraAlertStatus,
} from './wirelessCamerasSlice.js';
import { ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT } from '../../config.js';
import {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertContent,
  AlertTitle,
} from '../../components/AlertDialog.jsx';
import { DeleteImagesProgressBar } from '../images/DeleteImagesProgressBar.jsx';
import PermanentActionConfirmation from '../../components/PermanentActionConfirmation.jsx';
import Callout from '../../components/Callout.jsx';

const DeleteCameraAlert = () => {
  const deleteCameraLoading = useSelector(selectDeleteCameraLoading);
  const selectedCamera = useSelector(selectSelectedCamera);
  const imageCount = useSelector(selectCameraImageCount);
  const imageCountLoading = useSelector(selectCameraImageCountLoading);
  const isAlertOpen = useSelector(selectDeleteCameraAlertStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (imageCount === null && selectedCamera !== null && !imageCountLoading) {
      dispatch(fetchCameraImageCount({ cameraId: selectedCamera }));
    }
  }, [imageCount, selectedCamera, dispatch]);

  const [confirmedDelete, setConfirmedDelete] = useState(false);

  const handleDeleteCameraSubmit = () => {
    dispatch(deleteCamera({ cameraId: selectedCamera }));
  };

  const handleCancelDelete = () => {
    dispatch(setDeleteCameraAlertStatus({ isOpen: false }));
    dispatch(setSelectedCamera(null));
    dispatch(clearDeleteCameraTask());
    dispatch(clearCameraImageCount());
  };

  // handle polling for task completion
  useEffect(() => {
    const deleteCameraPending = deleteCameraLoading.isLoading && deleteCameraLoading.taskId;
    if (deleteCameraPending) {
      dispatch(fetchTask(deleteCameraLoading.taskId));
    }
  }, [deleteCameraLoading, dispatch]);

  return (
    <Alert open={isAlertOpen}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          {(deleteCameraLoading.isLoading || imageCountLoading) && (
            <SpinnerOverlay>
              <SimpleSpinner />
              <DeleteImagesProgressBar imageCount={imageCount} />
            </SpinnerOverlay>
          )}
          <AlertTitle>Delete Camera</AlertTitle>
          {/*TODO: Add a link to the documentation for more information on how to delete images.*/}
          <div>
            <Callout type="warning">
              {imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT ? (
                <p>
                  Due to the large number of images associated with this camera, we are unable to
                  delete Camera <strong>{selectedCamera}</strong> at this time. Please ensure that
                  the number of images associated with this camera do not exceed{' '}
                  {ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT} before trying again. We apologize for the
                  inconvenience.
                </p>
              ) : (
                <div>
                  <p>
                    Are you sure you&apos;d like to delete Camera <strong>{selectedCamera}</strong>?{' '}
                    {imageCount === 0 && 'This will remove the Camera and the Deployments '}
                    {!imageCountLoading && imageCount > 0 && (
                      <>
                        This will remove the Camera, its Deployments, and{' '}
                        {imageCount > 1 ? 'all' : 'the'}{' '}
                        <strong>
                          {imageCount} image{imageCount > 1 && 's'}
                        </strong>{' '}
                      </>
                    )}
                    associated with it from the Project.
                  </p>
                  <p>
                    <strong>This action cannot be undone.</strong>
                  </p>
                </div>
              )}
            </Callout>
            <PermanentActionConfirmation
              text="permanently delete"
              setConfirmed={setConfirmedDelete}
            />
          </div>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              size="small"
              disabled={deleteCameraLoading.isLoading}
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              disabled={
                deleteCameraLoading.isLoading ||
                imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT ||
                imageCountLoading ||
                !confirmedDelete
              }
              onClick={handleDeleteCameraSubmit}
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 },
              }}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default DeleteCameraAlert;
