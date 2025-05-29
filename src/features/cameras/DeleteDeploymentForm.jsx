import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { editDeployments, fetchTask, selectDeploymentsLoading } from '../tasks/tasksSlice.js';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const DepName = styled('span', {
  fontWeight: '$5',
});

const StyledHelperText = styled(HelperText, {
  '@bp2': {
    padding: '$3',
  },
  padding: '$3 0',
});

const StyledButtonRow = styled(ButtonRow, {
  display: 'flex',
  gap: '$2',
  flexDirection: 'column',
  '@bp2': {
    display: 'auto',
  },
});

const StyledButton = styled(Button, {
  width: '100%',
  '@bp2': {
    width: 'unset',
  },
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

  // handle polling for task completion
  useEffect(() => {
    const getDepsPending = depsLoading.isLoading && depsLoading.taskId;
    if (getDepsPending) {
      dispatch(fetchTask(depsLoading.taskId));
    }
  }, [depsLoading, dispatch]);

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
              <StyledHelperText>
                Are you sure you&apos;d like to delete the <DepName>{deployment.name}</DepName>{' '}
                deployment?
              </StyledHelperText>
              <Field name="cameraId" type="hidden" />
              <Field name="deploymentId" type="hidden" />
              <StyledButtonRow>
                <StyledButton type="button" size="large" onClick={handleClose}>
                  Cancel
                </StyledButton>
                <StyledButton type="submit" size="large">
                  Delete deployment
                </StyledButton>
              </StyledButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default DeleteDeploymentForm;
