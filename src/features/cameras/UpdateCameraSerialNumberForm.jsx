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
import Callout from '../../components/Callout.jsx';

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

  // if the camera is being merged, check which views will be affected
  const [affectedViews, setAffectedViews] = useState([]);
  useEffect(() => {
    if (isMerge) {
      const affectedViews = [];
      const sourceCam = project.cameraConfigs.find((cc) => cc._id === selectedCamera);
      const sourceDeployments = sourceCam?.deployments.map((dep) => dep._id.toString()) || [];
      project.views.forEach((view) => {
        if (view.filters.deployments?.length) {
          const isViewAffected = view.filters.deployments.some((depId) =>
            sourceDeployments.includes(depId),
          );
          if (isViewAffected && !affectedViews.includes(view.name)) {
            affectedViews.push(view.name);
          }
        }
      });
      setAffectedViews(affectedViews);
    }
  }, [selectedCamera, isMerge, project.views]);

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
              <FieldRow>
                <FormFieldWrapper>
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
              {isMerge && (
                <Callout type="warning" title="Merge warning">
                  <p>
                    A camera with the serial number you entered already exists. By updating camera{' '}
                    <strong>{selectedCamera}</strong> with this serial number, you will be{' '}
                    <strong>merging</strong> images from the selected camera to the target camera,
                    which can not be undone.
                  </p>
                  {affectedViews.length > 0 && (
                    <p>
                      Additionally, some of the deployments associated with the selected camera are{' '}
                      used as filters in the following Views:{' '}
                      {affectedViews.map((view, i) => (
                        <strong key={view}>
                          {view}
                          {i < affectedViews.length - 1 ? ', ' : ''}
                        </strong>
                      ))}
                      . If you complete this merge, the deployment filters associated with the
                      currently selected camera will be removed from those Views.
                    </p>
                  )}
                </Callout>
              )}
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
