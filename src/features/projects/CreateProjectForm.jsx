import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { timeZonesNames } from '@vvo/tzdb';
import tzlookup from 'tz-lookup';

import { styled } from '../../theme/stitches.config.js';
import {
  FormWrapper,
  FormFieldWrapper,
  FieldRow,
  ButtonRow,
  FormError,
} from '../../components/Form';
import Button from '../../components/Button.jsx';
import SelectField from '../../components/SelectField.jsx';
import LocationPicker from '../../components/LocationPicker.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { buildLocation } from '../../app/utils.js';

import {
  createProject,
  fetchModelOptions,
  selectModelOptions,
  selectCreateProjectLoading,
  selectModelOptionsLoading,
} from './projectsSlice.js';

const PageWrapper = styled('div', {
  maxWidth: '600px',
  padding: '0 $5',
  width: '100%',
  margin: '0 auto',
});

const Header = styled('div', {
  fontSize: '24px',
  fontWeight: '$5',
  fontFamily: '$roboto',
  paddingTop: '$8',
  marginBottom: '$4',
});

const TimezoneHint = styled('div', {
  fontSize: '$2',
  color: '$textLight',
  marginTop: '$1',
  fontStyle: 'italic',
});

const TimezoneAutoFill = ({ setInferredTimezone }) => {
  const { values, setFieldValue } = useFormikContext();
  const timerRef = useRef(null);
  const prevInferredRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const lat = parseFloat(values.latitude);
    const lng = parseFloat(values.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setInferredTimezone(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      try {
        const tz = tzlookup(lat, lng);
        if (timeZonesNames.includes(tz)) {
          setInferredTimezone(tz);
          if (values.timezone === '' || values.timezone === prevInferredRef.current) {
            setFieldValue('timezone', tz);
          }
          prevInferredRef.current = tz;
        }
      } catch {
        // tz-lookup throws on out-of-bounds coordinates
      }
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [values.latitude, values.longitude]);

  return null;
};

const typeOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
];

const stageOptions = [
  { value: 'demo', label: 'Demo' },
  { value: 'production', label: 'Production' },
];

const createProjectSchema = Yup.object().shape({
  name: Yup.string().required('Enter a project name'),
  description: Yup.string().required('Enter a short description'),
  type: Yup.string().required('Select a project type'),
  stage: Yup.string().required('Select a project stage'),
  organization: Yup.string().required('Enter an organization'),
  country: Yup.string().required('Enter a country'),
  state_province: Yup.string().required('Enter a state/province'),
  timezone: Yup.string().required('Select a timezone'),
  latitude: Yup.number()
    .required('Select a location on the map')
    .test('is-decimal', 'Coordinates must be in decimal degrees', (value) =>
      (value + '').match(/^-?[0-9]\d*(\.\d+)?$/),
    ),
  longitude: Yup.number()
    .required('Select a location on the map')
    .test('is-decimal', 'Coordinates must be in decimal degrees', (value) =>
      (value + '').match(/^-?[0-9]\d*(\.\d+)?$/),
    ),
  availableMLModels: Yup.array()
    .min(1, 'Select at least one ML model')
    .required('Select a ML model'),
});

const CreateProjectForm = () => {
  const dispatch = useDispatch();
  const mlModels = useSelector(selectModelOptions);
  const createProjectIsLoading = useSelector(selectCreateProjectLoading);
  const mlModelsOptionsIsLoading = useSelector(selectModelOptionsLoading);
  const [inferredTimezone, setInferredTimezone] = useState(null);

  const tzOptions = timeZonesNames.map((tz) => ({ value: tz, label: tz }));
  const mlModelOptions = useMemo(
    () =>
      mlModels.map(({ _id, description }) => ({
        value: _id,
        label: description,
      })),
    [mlModels],
  );

  useEffect(() => {
    dispatch(fetchModelOptions());
  }, []);

  return (
    <PageWrapper>
      {(createProjectIsLoading || mlModelsOptionsIsLoading) && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <Header>Create project</Header>
      <FormWrapper>
        <Formik
          initialValues={{
            name: '',
            description: '',
            type: '',
            stage: '',
            organization: '',
            country: '',
            state_province: '',
            timezone: '',
            latitude: '',
            longitude: '',
            availableMLModels: [],
          }}
          validationSchema={createProjectSchema}
          onSubmit={(values, { resetForm }) => {
            const { latitude, longitude, ...rest } = values;
            const payload = {
              ...rest,
              location: buildLocation(parseFloat(latitude), parseFloat(longitude)),
            };
            dispatch(createProject(payload, resetForm));
          }}
        >
          {({ values, errors, isValid, touched, setFieldTouched, setFieldValue }) => (
            <Form>
              <TimezoneAutoFill setInferredTimezone={setInferredTimezone} />
              {/* Project identity */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="name">Name</label>
                  <Field name="name" id="name" />
                  {!!errors.name && touched.name && <FormError>{errors.name}</FormError>}
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="description">Description</label>
                  <Field as="textarea" name="description" id="description" />
                  {!!errors.description && touched.description && (
                    <FormError>{errors.description}</FormError>
                  )}
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name="type"
                    label="Type"
                    options={typeOptions}
                    value={typeOptions.find(({ value }) => value === values.type)}
                    touched={touched.type}
                    onChange={(name, { value }) => setFieldValue(name, value)}
                    onBlur={(name) => setFieldTouched(name, true)}
                    error={errors.type}
                  />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name="stage"
                    label="Stage"
                    options={stageOptions}
                    value={stageOptions.find(({ value }) => value === values.stage)}
                    touched={touched.stage}
                    onChange={(name, { value }) => setFieldValue(name, value)}
                    onBlur={(name) => setFieldTouched(name, true)}
                    error={errors.stage}
                  />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="organization">Organization</label>
                  <Field name="organization" id="organization" />
                  {!!errors.organization && touched.organization && (
                    <FormError>{errors.organization}</FormError>
                  )}
                </FormFieldWrapper>
              </FieldRow>

              {/* Location */}
              <FieldRow>
                <FormFieldWrapper>
                  <label>Location</label>
                  <LocationPicker
                    latitude={values.latitude}
                    longitude={values.longitude}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    errors={errors}
                    touched={touched}
                  />
                </FormFieldWrapper>
              </FieldRow>

              {/* Geography */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="country">Country</label>
                  <Field name="country" id="country" />
                  {!!errors.country && touched.country && <FormError>{errors.country}</FormError>}
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="state_province">State / Province</label>
                  <Field name="state_province" id="state_province" />
                  {!!errors.state_province && touched.state_province && (
                    <FormError>{errors.state_province}</FormError>
                  )}
                </FormFieldWrapper>
              </FieldRow>

              {/* Timezone (after location for auto-inference) */}
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name="timezone"
                    label="Timezone"
                    options={tzOptions}
                    value={tzOptions.find(({ value }) => value === values.timezone)}
                    touched={touched.timezone}
                    onChange={(name, { value }) => {
                      setFieldValue(name, value);
                    }}
                    onBlur={(name, { value }) => {
                      setFieldTouched(name, value);
                    }}
                    error={errors.timezone}
                    maxMenuHeight={300}
                  />
                  {inferredTimezone && (
                    <TimezoneHint>Timezone at current Location is: {inferredTimezone}</TimezoneHint>
                  )}
                </FormFieldWrapper>
              </FieldRow>

              {/* ML models */}
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name="availableMLModels"
                    label="Available ML models"
                    options={mlModelOptions}
                    value={mlModelOptions.filter(({ value }) =>
                      values.availableMLModels.includes(value),
                    )}
                    touched={touched.availableMLModels}
                    onChange={(name, value) => {
                      setFieldValue(
                        name,
                        value.map((model) => model.value),
                      );
                    }}
                    onBlur={(name, { value }) => setFieldTouched(name, value)}
                    error={errors.availableMLModels}
                    maxMenuHeight={300}
                    isMulti
                  />
                </FormFieldWrapper>
              </FieldRow>
              <ButtonRow>
                <Button type="submit" size="large" disabled={!isValid}>
                  Save
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </PageWrapper>
  );
};

export default CreateProjectForm;
