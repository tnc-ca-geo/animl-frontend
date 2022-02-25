import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import { timeZonesNames } from '@vvo/tzdb';
import { styled } from '../../theme/stitches.config.js';
import { ObjectID } from 'bson';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';
import {
  editDeployments,
  selectProjectsLoading
} from '../projects/projectsSlice';
import Button from '../../components/Button';
import SelectField from '../../components/SelectField';
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

const ViewName = styled('span', {
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

const newDeploymentSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('A name is required'),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(500, 'Too Long!'),
  longitude: Yup.number().test(
    'is-decimal',
    'Coordinates must be in decimal degrees',
    value => (value + '').match(/^-?[0-9]\d*(\.\d+)?$/),
  ),
  latitude: Yup.number().test(
    'is-decimal',
    'Coordinates must be in decimal degrees',
    value => (value + '').match(/^-?[0-9]\d*(\.\d+)?$/), 
  ),
  startDate: Yup.date().transform((value, originalValue) => {
    value = moment(originalValue, EXIF);
    return value.isValid() ? value.toDate() : new Date('');
  }).required(),
});

const initialValsCreate = (project) => ({
  name: '',
  description: '',
  latitude: '',
  longitude: '',
  timezone: project.timezone,
  startDate: null,
  editable: true,
});

const SaveDeploymentForm = ({ project, cameraId, deployment, handleClose }) => {
  const saveMode = deployment ? 'updateDeployment' : 'createDeployment';
  const [queuedForClose, setQueuedForClose] = useState(false);
  const projectsLoading = useSelector(selectProjectsLoading);
  const timezoneOptions = timeZonesNames.map((tz) => (
    { value: tz, label: tz }
  ));
  console.log('timezoneOptions: ', timezoneOptions)
  const dispatch = useDispatch();
  const initialValues = saveMode === 'createDeployment' 
    ? initialValsCreate(project)
    : {
        name: deployment.name,
        description: deployment.description,
        latitude: deployment.location.geometry.coordinates[1],
        longitude: deployment.location.geometry.coordinates[0],
        timezone: deployment.timezone,
        startDate: deployment.startDate,
        editable: deployment.editable,
      };

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !projectsLoading) {
      handleClose();
    }
  }, [queuedForClose, projectsLoading, handleClose]);

  const createLocation = (lat, lon) => ({
    _id: new ObjectID().toString(),
    geometry: { type: 'Point', coordinates: [lon, lat]}
  });

  const diff = (formVals, deployment) => {
    let diffs = {};
    if (formVals.name !== deployment.name) {
      diffs.name = formVals.name;
    }
    if (formVals.description !== deployment.description) {
      diffs.description = formVals.description;
    }
    if (formVals.timezone !== deployment.timezone) {
      diffs.timezone = formVals.timezone;
    }
    if (formVals.startDate !== deployment.startDate) {
      diffs.startDate = formVals.startDate;
    }
    if ((formVals.latitude !== deployment.latitude) ||
        (formVals.longitude !== deployment.longitude)) {
      diffs.location = createLocation(formVals.latitude, formVals.longitude);
    }
    return diffs;
  };

  const handleSaveDeploymentSubmit = (operation, formVals) => {
    formVals.longitude = parseFloat(formVals.longitude);
    formVals.latitude = parseFloat(formVals.latitude);
    const payload = operation === 'createDeployment'
      ? {
          cameraId,
          deployment: {
            _id: new ObjectID().toString(),
            name: formVals.name,
            description: formVals.description,
            location: createLocation(formVals.latitude, formVals.longitude),
            timezone: formVals.timezone,
            startDate: formVals.startDate,
          }
        }
      : {
          cameraId,
          deploymentId: deployment._id,
          diffs: diff(formVals, deployment),
        };

    dispatch(editDeployments(operation, payload));
    setQueuedForClose(true);
  };

  return (
    <div>
      {projectsLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <FormHeader>
        {(saveMode === 'createDeployment')
          ? <span>Add deployment to camera {cameraId}</span>
          : <span>Updated deployment {deployment.name} on camera {cameraId}</span>
        }
      </FormHeader>
      <FormWrapper>
        <Formik
          initialValues={initialValues}
          validationSchema={newDeploymentSchema}
          onSubmit={(values) => {
            handleSaveDeploymentSubmit(saveMode, values);
          }}
        >
          {({ values, errors, touched, isValid, dirty, setFieldValue, setFieldTouched }) => {
            console.log('form values: ', values)
            return (
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
                  <SelectField
                    name='timezone'
                    label='Timezone'
                    value={{ value: values.timezone, label: values.timezone }}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'timezone.value') &&
                      errors.timezone.value
                    }
                    touched={touched.timezone}
                    options={timezoneOptions}
                  />
                </FormFieldWrapper>
                {/*<FormFieldWrapper>
                  <label htmlFor='timezone'>Timezone</label>
                  <Field
                    name='timezone'
                    id='timezone'
                  />
                  <ErrorMessage component={FormError} name='name' />
                </FormFieldWrapper>*/}
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
          )}}
        </Formik>
      </FormWrapper>
    </div>

  );
};

export default SaveDeploymentForm;

