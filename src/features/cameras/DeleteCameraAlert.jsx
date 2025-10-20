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
import { selectGlobalBreakpoint, selectSelectedCamera, setSelectedCamera } from '../projects/projectsSlice.js';
import {
  fetchCameraImageCount,
  selectCameraImageCount,
  selectCameraImageCountLoading,
  clearCameraImageCount,
  selectDeleteCameraAlertStatus,
  setDeleteCameraAlertStatus,
} from './wirelessCamerasSlice.js';
import { ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT, globalBreakpoints } from '../../config.js';
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
import { styled } from '../../theme/stitches.config.js';

const ButtonRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  '@bp2': {
    justifyContent: 'flex-end',
    gap: 25,
    flexDirection: 'row',
  },
});

const ScrollableAlertContent = styled(AlertContent, {
  overflowY: 'scroll'
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

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <Alert open={isAlertOpen}>
      <AlertPortal>
        <AlertOverlay />
        <ScrollableAlertContent>
          {(deleteCameraLoading.isLoading || imageCountLoading) && (
            <SpinnerOverlay>
              <SimpleSpinner />
              <DeleteImagesProgressBar imageCount={imageCount} />
            </SpinnerOverlay>
          )}
          <AlertTitle>Delete Camera</AlertTitle>
          <div>
            <Callout type="warning">
              {imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT ? (
                <>
                  <p>
                    Due to the large number of images associated with this camera, we are unable to
                    delete Camera <strong>{selectedCamera}</strong> at this time. Please ensure that
                    the number of images associated with this camera does not exceed{' '}
                    {ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT.toLocaleString()} before trying again.
                  </p>
                  <p>
                    You can reduce the number images associated with this camera by using the{' '}
                    <a
                      href="https://docs.animl.camera/fundamentals/deleting-images#deleting-all-currently-filtered-images"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      delete-images-by-filter
                    </a>{' '}
                    option to delete batches of images before fully deleting this Camera. We
                    apologize for the inconvenience.
                  </p>
                </>
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
                          {imageCount.toLocaleString()} image{imageCount > 1 && 's'}
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
          <ButtonRow>
            <Button
              type="button"
              size={isSmallScreen ? 'large' : 'small'}
              disabled={deleteCameraLoading.isLoading}
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size={isSmallScreen ? 'large' : 'small'}
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
          </ButtonRow>
        </ScrollableAlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default DeleteCameraAlert;
