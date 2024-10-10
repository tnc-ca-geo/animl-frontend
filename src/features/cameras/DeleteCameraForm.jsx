import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import { deleteCamera, fetchTask, selectDeleteCameraLoading } from '../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const CameraId = styled('span', {
  fontWeight: '$5',
});

const deleteCameraSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
});

const DeleteCameraForm = ({ cameraId, handleClose }) => {
  const [queuedForClose, setQueuedForClose] = useState(false);
  const deleteCameraLoading = useSelector(selectDeleteCameraLoading);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose) handleClose();
  }, [queuedForClose, handleClose]);

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

  return (
    <div>
      {deleteCameraLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper>
        <Formik
          initialValues={{ cameraId: cameraId }}
          validationSchema={deleteCameraSchema}
          onSubmit={(values) => {
            handleDeleteCameraSubmit(values);
          }}
        >
          {() => (
            <Form>
              <HelperText>
                Are you sure you&apos;d like to delete Camera <CameraId>{cameraId}</CameraId>? This
                will remove the camera from the project, remove all deployments associated with it,
                and delete all images. This action cannot be undone.
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
