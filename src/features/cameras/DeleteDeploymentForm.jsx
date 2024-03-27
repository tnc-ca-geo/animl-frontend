import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { editDeployments, selectDeploymentsLoading } from '../tasks/tasksSlice.js';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const DepName = styled('span', {
  fontWeight: '$5',
});

const deleteDeploymentSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
  deploymentId: Yup.string().required('A deployment ID is required'),
});

const DeleteDeploymentForm = ({ cameraId, deployment, handleClose }) => {
  const [queuedForClose, setQueuedForClose] = useState(false);
  const depsLoading = useSelector(selectDeploymentsLoading);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !depsLoading.isLoading) handleClose();
  }, [queuedForClose, depsLoading, handleClose]);

  const handleDeleteDeploymentSubmit = (formVals) => {
    dispatch(editDeployments('deleteDeployment', formVals));
    setQueuedForClose(true);
  };

  return (
    <div>
      {depsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper>
        <Formik
          initialValues={{ cameraId: cameraId, deploymentId: deployment._id }}
          validationSchema={deleteDeploymentSchema}
          onSubmit={(values) => {
            handleDeleteDeploymentSubmit(values);
          }}
        >
          {() => (
            <Form>
              <HelperText>
                Are you sure you&apos;d like to delete the <DepName>{deployment.name}</DepName>{' '}
                deployment?
              </HelperText>
              <Field name="cameraId" type="hidden" />
              <Field name="deploymentId" type="hidden" />
              <ButtonRow>
                <Button type="button" size="large" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" size="large">
                  Delete deployment
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default DeleteDeploymentForm;
