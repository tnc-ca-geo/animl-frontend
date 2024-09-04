import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import {
  FormWrapper,
  // FormSubheader,
  FieldRow,
  FormFieldWrapper,
  ButtonRow,
  FormError,
} from '../../components/Form';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectSelectedCamera } from '../projects/projectsSlice';
import {
  updateCameraSerialNumber,
  fetchTask,
  selectCameraSerialNumberLoading,
} from '../tasks/tasksSlice.js';

const updateSerialNumberSchema = Yup.object().shape({
  serialNumber: Yup.string().matches(
    /^[a-zA-Z0-9_.-]*$/,
    "Serial Numbers can't contain spaces or special characters",
  ),
});

const UpdateCameraSerialNumberForm = () => {
  const selectedCamera = useSelector(selectSelectedCamera);
  const dispatch = useDispatch();

  const handleUpdateSerialNumberSubmit = (formVals) => {
    console.log('handleUpdateSerialNumberSubmit() - formVals:', formVals);
    console.log('selectedCamera: ', selectedCamera);
    dispatch(updateCameraSerialNumber({ cameraId: selectedCamera, newId: formVals.serialNumber }));
  };

  // fetch task status
  const updateCameraSerialNumberLoading = useSelector(selectCameraSerialNumberLoading);
  useEffect(() => {
    const updateSerialNumberPending =
      updateCameraSerialNumberLoading.isLoading && updateCameraSerialNumberLoading.taskId;
    if (updateSerialNumberPending) {
      dispatch(fetchTask(updateCameraSerialNumberLoading.taskId));
    }
  }, [updateCameraSerialNumberLoading, dispatch]);

  return (
    <div>
      {updateCameraSerialNumberLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper>
        <Formik
          initialValues={{
            serialNumber: selectedCamera || '',
          }}
          validationSchema={updateSerialNumberSchema}
          onSubmit={(values) => handleUpdateSerialNumberSubmit(values)}
        >
          {({ isValid, dirty }) => (
            <Form>
              {/* <FormSubheader>Update Camera Serial Number</FormSubheader> */}
              <FieldRow>
                <FormFieldWrapper>
                  {/* <label htmlFor="serialNumber">New Serial Number</label> */}
                  <Field name="serialNumber" id="serialNumber" />
                  <ErrorMessage component={FormError} name="cameraId" />
                </FormFieldWrapper>
              </FieldRow>
              <ButtonRow>
                <Button type="submit" size="large" disabled={!isValid || !dirty}>
                  Update
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default UpdateCameraSerialNumberForm;
