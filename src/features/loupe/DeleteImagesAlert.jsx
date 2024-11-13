import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteImages,
  selectImagesCount,
  selectImagesCountLoading,
  selectDeleteImagesAlertState,
  setDeleteImagesAlertStatus,
  selectImagesLoading,
} from '../images/imagesSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { selectSelectedImages } from '../review/reviewSlice.js';
import {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertContent,
  AlertTitle,
} from '../../components/AlertDialog.jsx';
import Button from '../../components/Button.jsx';
import { red } from '@radix-ui/colors';
import { deleteImagesTask, fetchTask, selectDeleteImagesLoading } from '../tasks/tasksSlice.js';
import { IMAGE_DELETE_LIMIT } from '../../config.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const DeleteImagesAlert = () => {
  const dispatch = useDispatch();
  const alertState = useSelector(selectDeleteImagesAlertState);
  const selectedImages = useSelector(selectSelectedImages);
  const selectedImageIds = selectedImages.map((img) => img._id);

  const imagesLoading = useSelector(selectImagesLoading);
  const deleteImagesTaskLoading = useSelector(selectDeleteImagesLoading);

  const filters = useSelector(selectActiveFilters);
  const imageCountIsLoading = useSelector(selectImagesCountLoading);
  const imageCount = useSelector(selectImagesCount);

  useEffect(() => {
    if (deleteImagesTaskLoading.isLoading && deleteImagesTaskLoading.taskId) {
      dispatch(fetchTask(deleteImagesTaskLoading.taskId));
    }
  }, [deleteImagesTaskLoading, dispatch]);

  const handleConfirmDelete = () => {
    if (alertState.deleteImagesAlertByFilter) {
      dispatch(deleteImagesTask({ imageIds: [], filters: filters }));
    } else {
      if (selectedImages.length > IMAGE_DELETE_LIMIT) {
        dispatch(deleteImagesTask({ imageIds: selectedImageIds, filters: null }));
      } else {
        dispatch(deleteImages(selectedImageIds));
      }
    }
  };

  const handleCancelDelete = () => {
    dispatch(setDeleteImagesAlertStatus({ openStatus: false }));
  };

  const isSpinnerActive =
    (deleteImagesTaskLoading.isLoading && deleteImagesTaskLoading.taskId) ||
    (alertState.deleteImagesAlertByFilter && imageCountIsLoading.isLoading) ||
    imagesLoading.isLoading;

  const filterText = `Are you sure you'd like to delete ${imageCount === 1 ? 'this image' : `these ${imageCount && imageCount.toLocaleString()} images`}?`;
  const selectionText = `Are you sure you'd like to delete ${selectedImages.length === 1 ? 'this image' : `these ${selectedImages && selectedImages.length.toLocaleString()} images`}?`;
  return (
    <Alert open={alertState.deleteImagesAlertOpen}>
      <AlertPortal>
        <AlertOverlay />
        <AlertContent>
          {isSpinnerActive && (
            <SpinnerOverlay>
              <SimpleSpinner />
            </SpinnerOverlay>
          )}
          <AlertTitle>
            {alertState.deleteImagesAlertByFilter ? filterText : selectionText}
          </AlertTitle>
          <p>This action can not be undone.</p>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              size="small"
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 },
              }}
              onClick={handleConfirmDelete}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default DeleteImagesAlert;
