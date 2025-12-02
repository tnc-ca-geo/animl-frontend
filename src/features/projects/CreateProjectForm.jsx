import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { timeZonesNames } from '@vvo/tzdb';
import { Cross2Icon } from '@radix-ui/react-icons';

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
import { Toast, ToastTitle, ToastAction, ToastViewport } from '../../components/Toast';
import IconButton from '../../components/IconButton';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

import {
  createProject,
  selectCreateProjectState,
  dismissStateMsg,
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

const createProjectSchema = Yup.object().shape({
  name: Yup.string().required('Enter a project name'),
  description: Yup.string().required('Enter a short description'),
  timezone: Yup.string().required('Select a timezone'),
  availableMLModels: Yup.array()
    .min(1, 'Select at least one ML model')
    .required('Select a ML model'),
});

const CreateProjectForm = () => {
  const dispatch = useDispatch();
  const stateMsg = useSelector(selectCreateProjectState);
  const mlModels = useSelector(selectModelOptions);
  const createProjectIsLoading = useSelector(selectCreateProjectLoading);
  const mlModelsOptionsIsLoading = useSelector(selectModelOptionsLoading);

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
            timezone: '',
            availableMLModels: [],
          }}
          validationSchema={createProjectSchema}
          onSubmit={(values) => dispatch(createProject(values))}
        >
          {({ values, errors, isValid, touched, setFieldTouched, setFieldValue }) => (
            <Form>
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
                    name="timezone"
                    label="Timezone"
                    options={tzOptions}
                    value={tzOptions.find(({ value }) => value === values.timezone)}
                    touched={touched.timezone}
                    onChange={(name, { value }) => setFieldValue(name, value)}
                    onBlur={(name, { value }) => setFieldTouched(name, value)}
                    error={errors.timezone}
                    maxMenuHeight={300}
                  />
                </FormFieldWrapper>
              </FieldRow>
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
              {stateMsg && (
                <>
                  <Toast
                    open={!!stateMsg}
                    duration={2000}
                    onOpenChange={() => dispatch(dismissStateMsg())}
                  >
                    <ToastTitle variant="green" css={{ marginBottom: 0 }}>
                      {stateMsg}
                    </ToastTitle>
                    <ToastAction asChild altText="Dismiss">
                      <IconButton variant="ghost">
                        <Cross2Icon />
                      </IconButton>
                    </ToastAction>
                  </Toast>
                  <ToastViewport />
                </>
              )}
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </PageWrapper>
  );
};

export default CreateProjectForm;
