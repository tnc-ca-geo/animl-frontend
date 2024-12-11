import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import { deleteCamera, fetchTask, selectDeleteCameraLoading } from '../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { selectSelectedCamera } from '../projects/projectsSlice.js';
import {
  fetchCameraImageCount,
  selectCameraImageCount,
  selectCameraImageCountLoading,
} from '../cameras/wirelessCamerasSlice.js';

const BoldText = styled('span', {
  fontWeight: '$5',
});

const deleteCameraSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
});

const DeleteCameraForm = ({ handleClose }) => {
  const [queuedForClose, setQueuedForClose] = useState(false);
  const deleteCameraLoading = useSelector(selectDeleteCameraLoading);
  const selectedCamera = useSelector(selectSelectedCamera);
  const imageCount = useSelector(selectCameraImageCount);
  const imageCountLoading = useSelector(selectCameraImageCountLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    if (imageCount === null && selectedCamera !== null && !imageCountLoading) {
      dispatch(fetchCameraImageCount({ cameraId: selectedCamera }));
    }
  }, [imageCount, selectedCamera, dispatch]);

  useEffect(() => {
    if (queuedForClose && !deleteCameraLoading.isLoading) handleClose();
  }, [deleteCameraLoading, queuedForClose, handleClose]);

  const handleDeleteCameraSubmit = (formVals) => {
    dispatch(deleteCamera(formVals));
    setQueuedForClose(true);
  };

  // handle polling for task completion
  useEffect(() => {
    const getDepsPending = deleteCameraLoading.isLoading && deleteCameraLoading.taskId;
    if (getDepsPending) {
      dispatch(fetchTask(deleteCameraLoading.taskId));
    }
  }, [deleteCameraLoading, dispatch]);

  const imagesText = `${imageCount} ${imageCount === 1 ? ' image' : ' images'}`;

  return (
    <div>
      {(deleteCameraLoading.isLoading || imageCountLoading) && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper>
        <Formik
          initialValues={{ cameraId: selectedCamera }}
          validationSchema={deleteCameraSchema}
          onSubmit={(values) => {
            handleDeleteCameraSubmit(values);
          }}
        >
          {() => (
            <Form>
              <HelperText>
                Are you sure you&apos;d like to delete Camera <BoldText>{selectedCamera}</BoldText>?
                This will remove the camera from the project, remove all deployments associated with
                it, and <BoldText>{imagesText}</BoldText> will be deleted.{' '}
                <BoldText>This action cannot be undone.</BoldText>
              </HelperText>
              <Field name="cameraId" type="hidden" />
              <Field name="deploymentId" type="hidden" />
              <ButtonRow>
                <Button type="button" size="large" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" size="large">
                  Delete Camera
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default DeleteCameraForm;
