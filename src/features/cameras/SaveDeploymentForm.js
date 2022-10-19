import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import moment from 'moment-timezone';
import { timeZonesNames } from '@vvo/tzdb';
import { styled } from '../../theme/stitches.config.js';
import { ObjectID } from 'bson';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { editDeployments, selectDeploymentsLoading } from '../projects/projectsSlice';
import Button from '../../components/Button';
import SelectField from '../../components/SelectField';
import {
  FormWrapper,
  FieldRow,
  ButtonRow,
  FormFieldWrapper,
  FormError,
} from '../../components/Form';
import DatePickerWithFormik from '../../components/DatePicker';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


const FormHeader = styled('div', {
  fontWeight: '$3',
  textAlign: 'center'
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
  startDate: Yup.date().transform((value, originalValue, context) => {
    if (context.isType(value)) return value;
    // the default coercion failed so let's try it with Moment.js instead
    value = moment(originalValue);
    // if it's valid return the date object, otherwise return an `InvalidDate`
    return value.isValid() ? value.toDate() : new Date('');
  }).required(),
});

const SaveDeploymentForm = ({ project, cameraId, deployment, handleClose }) => {
  const operation = deployment ? 'updateDeployment' : 'createDeployment';
  const [queuedForClose, setQueuedForClose] = useState(false);
  const depsLoading = useSelector(selectDeploymentsLoading);
  const tzOptions = timeZonesNames.map((tz) => ({ value: tz, label: tz }));
  const dispatch = useDispatch();
  const initialValues = buildInitialValues(operation, deployment, project);
  updateGloablTimezone(initialValues.timezone);

  // handle closing
  useEffect(() => {
    if (queuedForClose && !depsLoading.isLoading) {
      console.log('closing save deployment form, so resetting moment global timezone to local time!');
      updateGloablTimezone();
      handleClose();
    }
  }, [queuedForClose, depsLoading, handleClose]);

  // handle saving and updating deployment
  const handleSaveDeploymentSubmit = (operation, formVals) => {
    console.log('handleSaveDeploymentSubmit() - values: ', formVals);
    formVals.longitude = parseFloat(formVals.longitude);
    formVals.latitude = parseFloat(formVals.latitude);
    
    if (operation === 'createDeployment') {
      dispatch(editDeployments(operation, {
        cameraId,
        deployment: {
          _id: new ObjectID().toString(),
          name: formVals.name,
          description: formVals.description,
          location: buildLocation(formVals.latitude, formVals.longitude),
          timezone: formVals.timezone.value,
          // startDate: startDateToString(formVals.startDate),
          startDate: formVals.startDate,
          editable: formVals.editable,
        }
      }));
    }
    else if (operation === 'updateDeployment') {
      dispatch(editDeployments(operation, {
        cameraId,
        deploymentId: deployment._id,
        diffs: diff(formVals, deployment),
      }));
    }
    setQueuedForClose(true);
  };

  return (
    <div>
      {depsLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <FormHeader>
        {(operation === 'createDeployment')
          ? <span>
              Add deployment to camera {cameraId}
            </span>
          : <span>
              Updated deployment {deployment.name} on camera {cameraId}
            </span>
        }
      </FormHeader>
      <FormWrapper>
        <Formik
          initialValues={initialValues}
          validationSchema={newDeploymentSchema}
          onSubmit={(values) => handleSaveDeploymentSubmit(operation, values)}
        >
          {({ values, errors, touched, isValid, dirty, 
            setFieldValue, setFieldTouched }) => (
            <Form>

              {/* name */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='name'>Name</label>
                  <Field name='name' id='name' />
                  <ErrorMessage component={FormError} name='name'/>
                </FormFieldWrapper>
              </FieldRow>

              {/* description */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='description'>Description</label>
                  <Field
                    name='description'
                    id='description'
                    component='textarea'
                  />
                  <ErrorMessage component={FormError} name='description'/>
                </FormFieldWrapper>
              </FieldRow>

              {/* lat/lon */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='latitude'>Latitude</label>
                  <Field name='latitude' id='latitude'/>
                  <ErrorMessage component={FormError} name='latitude'/>
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <label htmlFor='longitude'>Longitude</label>
                  <Field name='longitude' id='longitude'/>
                  <ErrorMessage component={FormError} name='longitude'/>
                </FormFieldWrapper>
              </FieldRow>

              {/* timezone */}
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name='timezone'
                    label='Timezone'
                    value={values.timezone}
                    onChange={(name, value) => {
                      const previousTZ = values.timezone.value;
                      const newTZ = value.value;
                      updateGloablTimezone(value);
                      setFieldValue(name, value);
                      // take current start date, shift it (while preserving local time)
                      // to new timezone, format as ISO string and set it imperatively
                      const startDate = moment(values.startDate).tz(previousTZ);
                      console.log('curr startDate: ', startDate.toISOString());
                      const newStartDate = startDate.tz(newTZ, true);
                      console.log('new startDate: ', newStartDate.toISOString());
                      setFieldValue('startDate', newStartDate.toISOString());
                    }}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'timezone.value') &&
                      errors.timezone.value
                    }
                    touched={touched.timezone}
                    options={tzOptions}
                    isSearchable={true}
                  />
                </FormFieldWrapper>
              </FieldRow>

              {/* start date */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='startDate'>Start Date</label>
                  <Field
                    component={DatePickerWithFormik}
                    timezone={values.timezone.value}
                    className="form-control"
                  />
                  <ErrorMessage component={FormError} name='startDate'/>
                </FormFieldWrapper>
              </FieldRow>

              <Field name='editable' type='hidden' />
              <ButtonRow>
                <Button
                  type='button'
                  size='large'
                  onClick={() => {
                    console.log('closing save deployment form, so resetting moment global timezone to local time!');
                    updateGloablTimezone();
                    handleClose();
                  }}>
                  Cancel
                </Button>
                <Button type='submit' size='large' disabled={!isValid || !dirty}>
                  Save
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};


function buildInitialValues(operation, deployment, project) {
  console.log('buildingInitialVals...')
  let vals = {};
  if (operation === 'createDeployment') {
    vals = {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      timezone: { value: project.timezone, label: project.timezone },
      startDate: null,
      editable: true,
    };
  }
  else if (operation === 'updateDeployment') {
    console.log('buildingInitialVals - op is updateDeployment. dep startDate: ', deployment.startDate);
    vals = {
      name: deployment.name,
      description: deployment.description,
      latitude: deployment.location.geometry.coordinates[1],
      longitude: deployment.location.geometry.coordinates[0],
      timezone: { value: deployment.timezone, label: deployment.timezone },
      startDate: deployment.startDate,
      editable: deployment.editable,
    };
  }
  console.log('buildingInitialVals - vals: ', vals);
  return vals;
};

const updateGloablTimezone = (tz) => {
  if (tz) {
    console.log('updating moment timezone globally: ', tz);
    moment.tz.setDefault(tz.value)
  } else {
    console.log('reverting moment global timezone to local timezone');
    moment.tz.setDefault();
  }
};

function buildLocation(lat, lon) {
  return {
    _id: new ObjectID().toString(),
    geometry: {
      type: 'Point', 
      coordinates: [lon, lat]
    }
  }
};

function diff(formVals, deployment) {
  const depLat = deployment.location.geometry.coordinates[1];
  const depLong = deployment.location.geometry.coordinates[0];

  let diffs = {};
  if (formVals.name !== deployment.name) {
    diffs.name = formVals.name;
  }
  if (formVals.description !== deployment.description) {
    diffs.description = formVals.description;
  }
  if (formVals.timezone.value !== deployment.timezone.value) {
    diffs.timezone = formVals.timezone.value;
  }
  if (formVals.startDate !== deployment.startDate) {
    diffs.startDate = formVals.startDate;
  }
  if ((formVals.latitude !== depLat) || (formVals.longitude !== depLong)) {
    diffs.location = buildLocation(formVals.latitude, formVals.longitude);
  }
  return diffs;
};


export default SaveDeploymentForm;

