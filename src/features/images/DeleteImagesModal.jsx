import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteImagesByFilterTask,
  fetchTask,
  selectDeleteImagesByFilterLoading,
} from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { ButtonRow, HelperText } from '../../components/Form';
import Button from '../../components/Button';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import { fetchImagesCount, fetchImages, deleteImages } from './imagesSlice.js';

const DeleteImagesModal = async () => {
  const filters = useSelector(selectActiveFilters);
  const deleteImagesByFilterLoading = useSelector(selectDeleteImagesByFilterLoading);
  const dispatch = useDispatch();

  const imageCount = await dispatch(fetchImagesCount(filters));

  const deleteImagesPending =
    deleteImagesByFilterLoading.isLoading && deleteImagesByFilterLoading.taskId;
  useEffect(() => {
    if (deleteImagesPending) {
      dispatch(fetchTask(deleteImagesByFilterLoading.taskId));
    }
  }, [deleteImagesPending, deleteImagesByFilterLoading, dispatch]);

  const handleDeleteImagesButtonClick = async () => {
    const { isLoading, errors } = deleteImagesByFilterLoading;
    const noErrors = !errors || errors.length === 0;
    if (!isLoading && noErrors) {
      if (imageCount > 100) {
        dispatch(deleteImagesByFilterTask({ filters }));
      } else {
        dispatch(fetchImages(filters)).then((images) => {
          dispatch(deleteImages({ images }));
        });
      }
    }
  };

  return (
    <div>
      {deleteImagesByFilterLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {imageCount === 0 && (
        <NoneFoundAlert>
          We couldn&apos;t find any images that matched this set of filters.
        </NoneFoundAlert>
      )}
      <HelperText>
        <p>
          Do you wish to delete all images that match the current filters? This action will delete
          {imageCount} images and cannot be undone.
        </p>
      </HelperText>
      <ButtonRow>
        <Button
          type="submit"
          size="large"
          disabled={deleteImagesByFilterLoading.isLoading}
          data-format="coco"
          onClick={handleDeleteImagesButtonClick}
        >
          Delete Images
        </Button>
      </ButtonRow>
    </div>
  );
};

export default DeleteImagesModal;
