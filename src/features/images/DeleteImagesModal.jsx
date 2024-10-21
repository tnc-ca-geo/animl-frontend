import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteImagesTask, fetchTask, selectDeleteImagesLoading } from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { ButtonRow, HelperText } from '../../components/Form';
import Button from '../../components/Button';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import { fetchImagesCount, fetchImages, deleteImages } from './imagesSlice.js';

const DeleteImagesModal = async () => {
  const filters = useSelector(selectActiveFilters);
  const deleteImagesLoading = useSelector(selectDeleteImagesLoading);
  const dispatch = useDispatch();

  const imageCount = await dispatch(fetchImagesCount(filters));

  const deleteImagesPending = deleteImagesLoading.isLoading && deleteImagesLoading.taskId;
  useEffect(() => {
    if (deleteImagesPending) {
      dispatch(fetchTask(deleteImagesLoading.taskId));
    }
  }, [deleteImagesPending, deleteImagesLoading, dispatch]);

  const handleDeleteImagesButtonClick = () => {
    const { isLoading, errors, noneFound } = deleteImagesLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      // const images = dispatch(fetchImages(filters));
      if (imageCount > 50) {
        dispatch(deleteImagesTask({ filters }));
      } else {
        dispatch(fetchImages(filters)).then((images) => {
          dispatch(deleteImages({ images }));
        });
      }
    }
  };

  return (
    <div>
      {deleteImagesLoading.isLoading && (
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
          disabled={deleteImagesLoading.isLoading}
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
