import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteImages, setDeleteImagesAlertOpen, selectDeleteImagesAlertOpen } from '../images/imagesSlice.js';
import { selectSelectedImages } from '../review/reviewSlice.js'
import { Alert, AlertPortal, AlertOverlay, AlertContent, AlertTitle } from '../../components/AlertDialog.jsx';
import Button from '../../components/Button.jsx';
import { red, mauve } from '@radix-ui/colors';


const DeleteImagesAlert = () => {
  const dispatch = useDispatch();
  const open = useSelector(selectDeleteImagesAlertOpen);
  const selectedImages = useSelector(selectSelectedImages);
  const selectedImageIds = selectedImages.map((img) => img._id);

  const handleConfirmDelete = (e) => {
    dispatch(deleteImages(selectedImageIds));
  };

  const handleCancelDelete = (e) => {
    dispatch(setDeleteImagesAlertOpen(false));
  };

  return (
    <Alert
      open={open}
    >
      <AlertPortal>
        <AlertOverlay/>
        <AlertContent>
          <AlertTitle>
            Are you sure you'd like to  
            delete {selectedImages.length > 1 
              ? `these ${selectedImages.length} images` 
              : `this image`
            }?
          </AlertTitle>
          <p>This action can not be undone.</p>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size='small' css={{ border: 'none' }} onClick={handleCancelDelete}>Cancel</Button>
            <Button
              size='small'
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 }
              }} 
              onClick={handleConfirmDelete}
            >
              Yes, delete
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  )
};

export default DeleteImagesAlert;