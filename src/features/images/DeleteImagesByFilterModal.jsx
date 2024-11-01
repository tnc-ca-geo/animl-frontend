import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteImagesByFilterTask,
  fetchTask,
  selectDeleteImagesByFilterLoading,
} from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { ButtonRow, HelperText } from '../../components/Form.jsx';
import Button from '../../components/Button.jsx';
import NoneFoundAlert from '../../components/NoneFoundAlert.jsx';
import { deleteImages, selectImagesCount, selectImagesCountLoading } from './imagesSlice.js';
import { setModalOpen, setModalContent } from '../projects/projectsSlice.js';
import { IMAGE_QUERY_LIMITS } from '../../config';
import { selectWorkingImages } from '../review/reviewSlice.js';

const DeleteImagesByFilterModal = () => {
  const filters = useSelector(selectActiveFilters);
  const deleteImagesByFilterLoading = useSelector(selectDeleteImagesByFilterLoading);
  const imageCountIsLoading = useSelector(selectImagesCountLoading);
  const workingImages = useSelector(selectWorkingImages);

  const dispatch = useDispatch();

  const imageCount = useSelector(selectImagesCount);

  useEffect(() => {
    if (deleteImagesByFilterLoading.isLoading && deleteImagesByFilterLoading.taskId) {
      dispatch(fetchTask(deleteImagesByFilterLoading.taskId));
    }
  }, [deleteImagesByFilterLoading, dispatch]);

  const handleDeleteImagesButtonClick = async () => {
    const { isLoading, errors } = deleteImagesByFilterLoading;
    const noErrors = !errors || errors.length === 0;
    if (!isLoading && noErrors) {
      if (imageCount <= IMAGE_QUERY_LIMITS[2]) {
        dispatch(deleteImages(workingImages.map((i) => i._id)));
      } else {
        dispatch(deleteImagesByFilterTask({ filters }));
      }
    }
  };

  const [isSpinnerActive, setSpinner] = useState(
    (deleteImagesByFilterLoading.isLoading && deleteImagesByFilterLoading.taskId) ||
      imageCountIsLoading.isLoading,
  );

  useEffect(() => {
    setSpinner(
      (deleteImagesByFilterLoading.isLoading && deleteImagesByFilterLoading.taskId) ||
        imageCountIsLoading.isLoading,
    );
  }, [deleteImagesByFilterLoading, imageCountIsLoading.isLoading]);

  const handleCancelDelete = () => {
    dispatch(setModalOpen(false));
    dispatch(setModalContent(null));
  };

  return (
    <div>
      {isSpinnerActive && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {imageCount === 0 ? (
        <NoneFoundAlert>
          We couldn&apos;t find any images that matched this set of filters.
        </NoneFoundAlert>
      ) : (
        <>
          <HelperText>
            <p>
              Do you wish to delete all images that match the current filters? This action will
              delete {imageCount} {imageCount > 1 ? 'images' : 'image'} and cannot be undone.
            </p>
          </HelperText>
          <ButtonRow>
            <Button size="large" css={{ border: 'none' }} onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="large"
              disabled={deleteImagesByFilterLoading.isLoading && deleteImagesByFilterLoading.taskId}
              onClick={handleDeleteImagesButtonClick}
            >
              Delete Images
            </Button>
          </ButtonRow>
        </>
      )}
    </div>
  );
};

export default DeleteImagesByFilterModal;
