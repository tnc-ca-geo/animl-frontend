import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { styled } from '../../theme/stitches.config.js';
import { ObjectID } from 'bson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';
import { editDeployments, selectCamerasLoading } from './camerasSlice';
import Button from '../../components/Button';
import {
  FormWrapper,
  FieldRow,
  ButtonRow,
  FormFieldWrapper,
  FormError,
  HelperText,
} from '../../components/Form';
import DatePickerWithFormik from '../../components/DatePicker';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';

const FormHeader = styled('div', {
  fontWeight: '$3',
  textAlign: 'center'
});

const DepName = styled('span', {
  fontWeight: '$5',
});

const Row = styled('div', {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  '&:not(:last-child)': {
    marginBottom: '$5',
  }
});

const deleteDeploymentSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
  deploymentId: Yup.string().required('A deployment ID is required'),
});

const DeleteDeploymentForm = ({ cameraId, deployment, handleClose }) => {
  const [queuedForClose, setQueuedForClose ] = useState(false);
  const camerasLoading = useSelector(selectCamerasLoading);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !camerasLoading) {
      handleClose();
    }
  }, [queuedForClose, camerasLoading, handleClose]);

  const handleDeleteDeploymentSubmit = (formVals) => {
    dispatch(editDeployments('deleteDeployment', formVals));
    setQueuedForClose(true);
  };
  
  return (
    <div>
      {camerasLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <FormWrapper>
        <Formik
          initialValues={{ cameraId: cameraId, deploymentId: deployment._id }}
          validationSchema={deleteDeploymentSchema}
          onSubmit={(values) => { handleDeleteDeploymentSubmit(values)}}
        >
          {({ errors, touched }) => (
            <Form>
              <HelperText>
                Are you sure you'd like to delete 
                the <DepName>{deployment.name}</DepName> deployment?
              </HelperText>
              <Field
                name='cameraId'
                type='hidden'
              />
              <Field
                name='deploymentId'
                type='hidden'
              />
              <ButtonRow>
                <Button
                  type='button'
                  size='large'
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type='submit' size='large'>
                  Delete deployment
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>

      {/*<FormWrapper>
        <Formik
          initialValues={initialValues}
          validationSchema={newDeploymentSchema}
          onSubmit={(values) => {
            handleSaveDeploymentSubmit(saveMode, values);
          }}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='name'>Name</label>
                  <Field
                    name='name'
                    id='name'
                  />
                  <ErrorMessage component={FormError} name='name' />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='description'>Description</label>
                  <Field
                    name='description'
                    id='description'
                    component='textarea'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='description'
                  />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='latitude'>Latitude</label>
                  <Field
                    name='latitude'
                    id='latitude'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='latitude'
                  />
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <label htmlFor='longitude'>Longitude</label>
                  <Field
                    name='longitude'
                    id='longitude'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='longitude'
                  />
                </FormFieldWrapper>
              </FieldRow>

              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='startDate'>Start Date</label>
                  <Field
                    component={DatePickerWithFormik}
                    // name="DatePickerWithFormik"
                    className="form-control"
                  />
                  <ErrorMessage
                    component={FormError}
                    name='startDate'
                  />
                </FormFieldWrapper>
              </FieldRow>

              <Field
                name='editable'
                type='hidden'
              />
              <ButtonRow>
                <Button
                  type='button'
                  size='large'
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  size='large'
                  disabled={!isValid || !dirty}
                >
                  Save
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>*/}
    </div>

  );
};

export default DeleteDeploymentForm;

