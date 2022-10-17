import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';
import { DateTime } from 'luxon';
import moment from 'moment';
import { timeZonesNames } from '@vvo/tzdb';
import { styled } from '../../theme/stitches.config.js';
import { ObjectID } from 'bson';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DATE_FORMAT_EXIF as EXIF } from '../../config';
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
    value = moment(originalValue, EXIF);
    // if it's valid return the date object, otherwise return an `InvalidDate`
    return value.isValid() ? value.toDate() : new Date('');
    // NOTE: this is what I had previously w/ timezone-fix:
    // return originalValue && originalValue.isValid() 
    // ? originalValue.toDate() 
    // : new Date('');
  }).required(),
});

// TODO TIME: figure out if we want to keep start time in Formik state as 
// ISO string? or as moment date time
// also decide whether the date picker component should be responsible for 
// the start-of-day conversion or not


const SaveDeploymentForm = ({ project, cameraId, deployment, handleClose }) => {
  const operation = deployment ? 'updateDeployment' : 'createDeployment';
  const [queuedForClose, setQueuedForClose] = useState(false);
  const depsLoading = useSelector(selectDeploymentsLoading);
  const tzOptions = timeZonesNames.map((tz) => ({ value: tz, label: tz }));
  const dispatch = useDispatch();
  const initialValues = buildInitialValues(operation, deployment, project);
  
  // handle closing
  useEffect(() => {
    if (queuedForClose && !depsLoading.isLoading) handleClose();
  }, [queuedForClose, depsLoading, handleClose]);

  // handle saving and updating deployment
  const handleSaveDeploymentSubmit = (operation, formVals) => {

    console.log('handleSaveDeploymentSubmit: ', formVals);

    formVals.longitude = parseFloat(formVals.longitude);
    formVals.latitude = parseFloat(formVals.latitude);
    
    if (operation === 'createDeployment') {
      console.log(`handleSaveDeploymentSubmit - initial startDate from fromt: ${formVals.startDate.format()}`)



      dispatch(editDeployments(operation, {
        cameraId,
        deployment: {
          _id: new ObjectID().toString(),
          name: formVals.name,
          description: formVals.description,
          location: buildLocation(formVals.latitude, formVals.longitude),
          timezone: formVals.timezone.value,
          startDate: startDateToString(formVals.startDate),
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
          onSubmit={(values) => {
            handleSaveDeploymentSubmit(operation, values);
          }}
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
                    onChange={setFieldValue}
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
                <Button type='button' size='large' onClick={handleClose}>
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
      startDate: moment.tz(deployment.startDate, deployment.timezone),
      editable: deployment.editable,
    };
  }
  console.log('buildingInitialVals - vals: ', vals);
  return vals;
}

function buildLocation(lat, lon) {
  return {
    _id: new ObjectID().toString(),
    geometry: {
      type: 'Point', 
      coordinates: [lon, lat]
    }
  }
}

function startDateToString(startDate) {
  // // shift timezone to TZ in form's select field
  // let startDate = formVals.startDate.tz(formVals.timezone.value, true);
  // console.log(`handleSaveDeploymentSubmit - date after TZ w/ keep local time set: ${startDate}`)

  // shift to start of day (Moment's default is noon)
  let sd = startDate.startOf('day');
  console.log(`handleSaveDeploymentSubmit - date after startOfDay reset: ${sd}`)

  // format as ISO string, but keep offset
  sd = startDate.toISOString(true);
  console.log(`handleSaveDeploymentSubmit - date after ISO string conversion: ${sd}`)

  return sd;
}

function diff(formVals, deployment) {
  const depLat = deployment.location.geometry.coordinates[1];
  const depLong = deployment.location.geometry.coordinates[0];
  const startDateString = (formVals.startDate) 
    ? startDateToString(formVals.startDate)
    : null;

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
  if (startDateString !== deployment.startDate) {
    diffs.startDate = startDateString;
  }
  if ((formVals.latitude !== depLat) || (formVals.longitude !== depLong)) {
    diffs.location = buildLocation(formVals.latitude, formVals.longitude);
  }
  return diffs;
}


export default SaveDeploymentForm;

