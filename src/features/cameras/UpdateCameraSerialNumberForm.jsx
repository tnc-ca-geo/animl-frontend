import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import {
  FormWrapper,
  FieldRow,
  FormFieldWrapper,
  ButtonRow,
  FormError,
} from '../../components/Form';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectSelectedProject, selectSelectedCamera } from '../projects/projectsSlice';
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
    dispatch(updateCameraSerialNumber({ cameraId: selectedCamera, newId: formVals.serialNumber }));
  };

  const project = useSelector(selectSelectedProject);
  const cameraIds = project?.cameraConfigs.map((cc) => cc._id);
  const [isMerge, setIsMerge] = useState(false);
  const handleInputChange = (values) => {
    if (values.serialNumber === selectedCamera) {
      setIsMerge(false);
      return;
    }
    setIsMerge(cameraIds.includes(values.serialNumber));
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
          {({ isValid, dirty, values, setFieldTouched }) => (
            <Form>
              <p>Update Camera Serial Number</p>
              {isMerge && (
                <p>
                  NOTE: a camera with this serial number already exists. By updating the selected
                  camera, you will be merging images from the selected camera to the target camera
                </p>
              )}
              <FieldRow>
                <FormFieldWrapper>
                  {/* <label htmlFor="serialNumber">New Serial Number</label> */}
                  <Field
                    name="serialNumber"
                    id="serialNumber"
                    onKeyUp={() => {
                      handleInputChange(values);
                      setFieldTouched('serialNumber', true);
                    }}
                  />
                  <ErrorMessage component={FormError} name="serialNumber" />
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
