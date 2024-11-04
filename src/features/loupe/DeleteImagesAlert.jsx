import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteImages,
  selectImagesCount,
  selectImagesCountLoading,
  selectDeleteImagesAlertState,
  setDeleteImagesAlertClose,
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

  const deleteImagesLoading = useSelector(selectDeleteImagesLoading);

  const filters = useSelector(selectActiveFilters);
  const imageCountIsLoading = useSelector(selectImagesCountLoading);
  const imageCount = useSelector(selectImagesCount);

  useEffect(() => {
    if (deleteImagesLoading.isLoading && deleteImagesLoading.taskId) {
      dispatch(fetchTask(deleteImagesLoading.taskId));
    }
  }, [deleteImagesLoading, dispatch]);

  const handleConfirmDelete = () => {
    if (alertState.deleteImagesAlertByFilter) {
      dispatch(deleteImagesTask([], filters, true));
    } else {
      if (selectedImages.length > IMAGE_DELETE_LIMIT) {
        dispatch(deleteImagesTask(selectedImageIds, null, false));
      } else {
        dispatch(deleteImages(selectedImageIds));
      }
    }
  };

  const handleCancelDelete = () => {
    dispatch(setDeleteImagesAlertClose());
  };

  const [isSpinnerActive, setSpinner] = useState(
    (deleteImagesLoading.isLoading && deleteImagesLoading.taskId) ||
      (alertState.deleteImagesAlertByFilter && imageCountIsLoading.isLoading),
  );

  useEffect(() => {
    setSpinner(
      (deleteImagesLoading.isLoading && deleteImagesLoading.taskId) ||
        (alertState.deleteImagesAlertByFilter && imageCountIsLoading.isLoading),
    );
  }, [deleteImagesLoading, imageCountIsLoading.isLoading]);

  const filterText = `Are you sure you'd like to delete ${imageCount === 1 ? 'this image' : `these ${imageCount} images`}?`;
  const selectionText = `Are you sure you'd like to delete ${selectedImages.length === 1 ? 'this image' : `these ${selectedImages.length} images`}?`;
  return (
    <Alert open={alertState.deleteImagesAlertOpen}>
      <AlertPortal>
        <AlertOverlay>
          {isSpinnerActive && (
            <SpinnerOverlay>
              <SimpleSpinner />
            </SpinnerOverlay>
          )}
        </AlertOverlay>
        <AlertContent>
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
