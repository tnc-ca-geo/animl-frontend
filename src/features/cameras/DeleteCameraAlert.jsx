import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { red } from '@radix-ui/colors';
import { styled } from '../../theme/stitches.config.js';
import Button from '../../components/Button.jsx';
import { ButtonRow } from '../../components/Form.jsx';
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

const BoldText = styled('span', {
  fontWeight: '$5',
});

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
          {imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT ? (
            <>
              Due to the large number of images associated with this camera, we are unable to delete
              Camera <BoldText>{selectedCamera}</BoldText> at this time. Please ensure that the
              number of images associated with this camera do not exceed{' '}
              {ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT} before trying again. We apologize for the
              inconvenience.
            </>
          ) : (
            <>
              <p>
                Are you sure you&apos;d like to delete Camera <BoldText>{selectedCamera}</BoldText>?{' '}
                {imageCount === 0 && 'This will remove the Camera and the Deployments '}
                {imageCount > 0 && (
                  <>
                    This will remove the Camera, its Deployments, and{' '}
                    {imageCount > 1 ? 'all' : 'the'}{' '}
                    <BoldText>
                      {imageCount} image{imageCount > 1 && 's'}
                    </BoldText>{' '}
                  </>
                )}
                associated with it from the Project.
              </p>
              <p>
                <BoldText>This action cannot be undone.</BoldText>
              </p>
              <ButtonRow>
                <Button
                  type="button"
                  size="large"
                  disabled={deleteCameraLoading.isLoading}
                  onClick={handleCancelDelete}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="large"
                  disabled={
                    deleteCameraLoading.isLoading ||
                    imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT ||
                    imageCountLoading
                  }
                  onClick={handleDeleteCameraSubmit}
                  css={{
                    backgroundColor: red.red4,
                    color: red.red11,
                    border: 'none',
                    '&:hover': { color: red.red11, backgroundColor: red.red5 },
                  }}
                >
                  Delete Camera
                </Button>
              </ButtonRow>
            </>
          )}
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default DeleteCameraAlert;
