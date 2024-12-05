import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteImages,
  selectImagesCountLoading,
  selectDeleteImagesAlertState,
  setDeleteImagesAlertStatus,
  selectImagesLoading,
  selectImagesCount,
} from './imagesSlice.js';
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
import {
  SYNC_IMAGE_DELETE_LIMIT,
  ASYNC_IMAGE_DELETE_BY_ID_LIMIT,
  ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT,
} from '../../config.js';
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
      // if deleting by filter, always delete using task handler
      dispatch(deleteImagesTask({ imageIds: [], filters: filters }));
    } else {
      // if deleting by selection of IDs, use task handler if over limit
      if (selectedImages.length > SYNC_IMAGE_DELETE_LIMIT) {
        dispatch(deleteImagesTask({ imageIds: selectedImageIds, filters: null }));
      } else {
        dispatch(deleteImages(selectedImageIds));
      }
    }
  };

  const handleCancelDelete = () => {
    dispatch(setDeleteImagesAlertStatus({ openStatus: false }));
  };

  const deleteByIdLimitExceeded =
    !alertState.deleteImagesAlertByFilter && selectedImages.length > ASYNC_IMAGE_DELETE_BY_ID_LIMIT;
  const byFilterLimitExceeded =
    alertState.deleteImagesAlertByFilter && imageCount > ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT;

  const isSpinnerActive =
    (deleteImagesTaskLoading.isLoading && deleteImagesTaskLoading.taskId) ||
    (alertState.deleteImagesAlertByFilter && imageCountIsLoading.isLoading) ||
    imagesLoading.isLoading;

  const filterTitle = `Are you sure you'd like to delete ${imageCount === 1 ? 'this image' : `these ${imageCount && imageCount.toLocaleString()} images`}?`;
  const selectionTitle = `Are you sure you'd like to delete ${selectedImages.length === 1 ? 'this image' : `these ${selectedImages && selectedImages.length.toLocaleString()} images`}?`;
  const defaultText = (
    <div>
      <p>This action can not be undone.</p>
    </div>
  );

  const deleteByIdLimitAlertTitle = 'Delete Limit Exceeded';
  const deleteByIdLimitAlertText = (
    <div>
      <p>
        You have selected {selectedImages.length.toLocaleString()} images, which is more than the{' '}
        {ASYNC_IMAGE_DELETE_BY_ID_LIMIT.toLocaleString()} image limit Animl supports when deleting
        individually-selected images.
      </p>
      {/*TODO: Add a link to the documentation for more information on how to delete images.*/}
      <p>
        Please select fewer images, or use the delete-by-filter option, which can accommodate
        deleting up to {ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT.toLocaleString()} images at a time.
      </p>
    </div>
  );

  const deleteByFilterLimitAlertTitle = 'Delete Limit Exceeded';
  const deleteByFilterLimitAlertText = (
    <div>
      <p>
        There are {imageCount?.toLocaleString()} images that match the currently selected filters,
        which is more than the {ASYNC_IMAGE_DELETE_BY_FILTER_LIMIT.toLocaleString()} image limit
        Animl supports when deleting images by filter.
      </p>
      <p>
        To delete all of the currently matching images, you may need to apply additional filters to
        stay within the limit and perform multiple separate deletion requests.
      </p>
    </div>
  );

  let title = alertState.deleteImagesAlertByFilter ? filterTitle : selectionTitle;
  let text = defaultText;
  if (deleteByIdLimitExceeded) {
    title = deleteByIdLimitAlertTitle;
    text = deleteByIdLimitAlertText;
  } else if (byFilterLimitExceeded) {
    title = deleteByFilterLimitAlertTitle;
    text = deleteByFilterLimitAlertText;
  }

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
          <AlertTitle>{title}</AlertTitle>
          {text}
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              size="small"
              disabled={deleteByIdLimitExceeded || byFilterLimitExceeded}
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
