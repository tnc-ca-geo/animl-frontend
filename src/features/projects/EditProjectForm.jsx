import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { timeZonesNames } from '@vvo/tzdb';
import tzlookup from 'tz-lookup';
import { components } from 'react-select';
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
  fetchProjects,
  fetchModelOptions,
  updateProject,
  selectProjects,
  selectProjectsLoading,
  selectModelOptions,
  selectModelOptionsLoading,
  selectUpdateProjectLoading,
} from './projectsSlice.js';

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

const editProjectSchema = Yup.object().shape({
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

function diffProject(formVals, originalProject) {
  const diffs = {};
  if (formVals.name !== originalProject.name) diffs.name = formVals.name;
  if (formVals.description !== originalProject.description)
    diffs.description = formVals.description;
  if (formVals.type !== originalProject.type) diffs.type = formVals.type;
  if (formVals.stage !== originalProject.stage) diffs.stage = formVals.stage;
  if (formVals.organization !== originalProject.organization)
    diffs.organization = formVals.organization;
  if (formVals.country !== originalProject.country) diffs.country = formVals.country;
  if (formVals.state_province !== originalProject.state_province)
    diffs.state_province = formVals.state_province;
  if (formVals.timezone !== originalProject.timezone) diffs.timezone = formVals.timezone;

  const origLat = originalProject.location?.geometry?.coordinates?.[1];
  const origLng = originalProject.location?.geometry?.coordinates?.[0];
  if (parseFloat(formVals.latitude) !== origLat || parseFloat(formVals.longitude) !== origLng) {
    diffs.location = buildLocation(parseFloat(formVals.latitude), parseFloat(formVals.longitude));
  }

  const origModels = [...(originalProject.availableMLModels || [])].sort();
  const currentModels = [...formVals.availableMLModels].sort();
  if (JSON.stringify(origModels) !== JSON.stringify(currentModels)) {
    diffs.availableMLModels = formVals.availableMLModels;
  }

  return diffs;
}

function projectToFormValues(project) {
  return {
    name: project.name || '',
    description: project.description || '',
    type: project.type || '',
    stage: project.stage || '',
    organization: project.organization || '',
    country: project.country || '',
    state_province: project.state_province || '',
    timezone: project.timezone || '',
    latitude: project.location?.geometry?.coordinates?.[1] ?? '',
    longitude: project.location?.geometry?.coordinates?.[0] ?? '',
    availableMLModels: project.availableMLModels || [],
  };
}

// Hide remove button for existing ML model chips
const NonRemovableMultiValueRemove = (existingModelIds) => {
  return function MultiValueRemove(props) {
    if (existingModelIds.has(props.data.value)) {
      return null;
    }
    return <components.MultiValueRemove {...props} />;
  };
};

const EditProjectForm = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const projectsLoading = useSelector(selectProjectsLoading);
  const mlModels = useSelector(selectModelOptions);
  const mlModelsOptionsIsLoading = useSelector(selectModelOptionsLoading);
  const updateProjectIsLoading = useSelector(selectUpdateProjectLoading);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [inferredTimezone, setInferredTimezone] = useState(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const initialValues = useMemo(
    () =>
      selectedProject
        ? projectToFormValues(selectedProject)
        : {
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
          },
    [selectedProject],
  );

  const existingModelIds = useMemo(
    () => new Set(selectedProject?.availableMLModels || []),
    [selectedProject],
  );

  const mlModelComponents = useMemo(
    () => ({ MultiValueRemove: NonRemovableMultiValueRemove(existingModelIds) }),
    [existingModelIds],
  );

  const projectOptions = useMemo(
    () =>
      projects
        .filter((p) => p._id !== 'default_project')
        .map((p) => ({ value: p._id, label: p.name })),
    [projects],
  );

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
    dispatch(fetchProjects());
    dispatch(fetchModelOptions());
  }, []);

  const handleProjectSelect = useCallback(
    (name, { value }) => {
      setSelectedProjectId(value);
      dispatch(fetchProjects({ _ids: [value] }));
    },
    [dispatch],
  );

  const isLoading = projectsLoading.isLoading || mlModelsOptionsIsLoading || updateProjectIsLoading;

  return (
    <>
      {isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <Header>Edit Project</Header>
      <FormWrapper>
        <FieldRow>
          <FormFieldWrapper>
            <SelectField
              name="projectSelector"
              label="Select a Project"
              options={projectOptions}
              value={projectOptions.find(({ value }) => value === selectedProjectId)}
              touched={false}
              onChange={handleProjectSelect}
              onBlur={() => {}}
              error={null}
              isSearchable
            />
          </FormFieldWrapper>
        </FieldRow>

        {selectedProject && (
          <Formik
            key={selectedProjectId}
            initialValues={initialValues}
            enableReinitialize
            validationSchema={editProjectSchema}
            onSubmit={(values) => {
              const diffs = diffProject(values, selectedProject);
              if (Object.keys(diffs).length === 0) return;
              dispatch(
                updateProject(selectedProjectId, diffs, () => {
                  dispatch(fetchProjects({ _ids: [selectedProjectId] }));
                }),
              );
            }}
          >
            {({ values, errors, isValid, dirty, touched, setFieldTouched, setFieldValue }) => (
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

                {/* Timezone */}
                <FieldRow>
                  <FormFieldWrapper>
                    <SelectField
                      name="timezone"
                      label="Timezone"
                      options={tzOptions}
                      value={tzOptions.find(({ value }) => value === values.timezone)}
                      touched={touched.timezone}
                      onChange={(name, { value }) => setFieldValue(name, value)}
                      onBlur={(name) => setFieldTouched(name, true)}
                      error={errors.timezone}
                      maxMenuHeight={300}
                    />
                    {inferredTimezone && (
                      <TimezoneHint>
                        Timezone at current Location is: {inferredTimezone}
                      </TimezoneHint>
                    )}
                  </FormFieldWrapper>
                </FieldRow>

                {/* ML models (add-only) */}
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
                        const newIds = value.map((v) => v.value);
                        // Ensure existing models are never removed
                        const merged = [
                          ...existingModelIds,
                          ...newIds.filter((id) => !existingModelIds.has(id)),
                        ];
                        setFieldValue(name, merged);
                      }}
                      onBlur={(name) => setFieldTouched(name, true)}
                      error={errors.availableMLModels}
                      maxMenuHeight={300}
                      isMulti
                      components={mlModelComponents}
                    />
                  </FormFieldWrapper>
                </FieldRow>

                <ButtonRow>
                  <Button type="submit" size="large" disabled={!isValid || !dirty}>
                    Save changes
                  </Button>
                </ButtonRow>
              </Form>
            )}
          </Formik>
        )}
      </FormWrapper>
    </>
  );
};

export default EditProjectForm;
