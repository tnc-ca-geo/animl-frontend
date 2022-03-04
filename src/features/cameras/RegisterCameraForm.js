import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  registerCamera,
  selectProjectsLoading,
  selectCameraRegistrationError,
} from '../projects/projectsSlice';
import SelectField from '../../components/SelectField';
import Button from '../../components/Button';
import {
  FormWrapper,
  FormSubheader,
  FieldRow,
  FormFieldWrapper,
  ButtonRow,
  HelperText,
  FormError
} from '../../components/Form';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import { SUPPORTED_CAM_MAKES  } from '../../config.js';

const DepName = styled('span', {
  fontWeight: '$5',
});

// TODO: improve validation? Make sure cameraId is not already actively 
// registered to current project
const registerCameraSchema = Yup.object().shape({
  cameraId: Yup.string().required('A camera ID is required'),
  make: Yup.object().shape({
    label: Yup.string().required(),
    value: Yup.string().required('An camera make is required'),
  }),
});

const RegisterCameraForm = ({ cameraId, deployment, handleClose }) => {
  // const [queuedForClose, setQueuedForClose ] = useState(false);
  const projectsLoading = useSelector(selectProjectsLoading);
  const cameraRegistrationError = useSelector(selectCameraRegistrationError);
  const makeOptions = SUPPORTED_CAM_MAKES.map((m) => ({ value: m, label: m }));
  const dispatch = useDispatch();

  // TODO: extract into hook?
  // useEffect(() => {
  //   if (queuedForClose && !projectsLoading) {
  //     handleClose();
  //   }
  // }, [queuedForClose, projectsLoading, handleClose]);

  const handleRegisterCameraSubmit = (formVals) => {
    console.log('handleRegisterCameraSubmit() - formVals: ', formVals);
    dispatch(registerCamera({
      cameraId: formVals.cameraId,
      make: formVals.make.value,
    }));
    // setQueuedForClose(true);
  };
  
  return (
    <div>
      {projectsLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <FormWrapper>
        <Formik
          initialValues={{
            cameraId: '',
            make: makeOptions[0]
          }}
          validationSchema={registerCameraSchema}
          onSubmit={(values) => { 
            console.log('onSubmit firing')
            handleRegisterCameraSubmit(values)
          }}
        >
          {({ values, errors, touched, isValid, dirty, setFieldValue, setFieldTouched }) => (
            <Form>
              <FormSubheader>
                Register a new camera
              </FormSubheader>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='name'>Camera Serial Number</label>
                  <Field
                    name='cameraId'
                    id='cameraId'
                  />
                  {/*<ErrorMessage component={FormError} name='cameraId' />*/}
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <SelectField
                    name='make'
                    label='Camera Make'
                    value={values.make}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'make.value') &&
                      errors.make.value
                    }
                    touched={touched.make}
                    options={makeOptions}
                  />
                </FormFieldWrapper>
              </FieldRow>
              <ButtonRow>
                <Button
                  type='submit'
                  size='large'
                  disabled={!isValid || !dirty}
                >
                  Register Camera
                </Button>
              </ButtonRow>
              {cameraRegistrationError &&           
                <FormError>
                  {cameraRegistrationError}
                </FormError>
              }
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>

  );
};

export default RegisterCameraForm;

