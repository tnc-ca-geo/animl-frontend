import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { timeZonesNames } from '@vvo/tzdb';

import { styled } from '../../theme/stitches.config.js';
import { FormWrapper, FormFieldWrapper, FieldRow, ButtonRow, FormError } from '../../components/Form';
import Button from '../../components/Button.jsx';
import SelectField from '../../components/SelectField.jsx';

const PageWrapper = styled('div', {
  maxWidth: '600px',
  padding: '0 $5',
  width: '100%',
  margin: '0 auto'
});

const Header = styled('div', {
  fontSize: '24px',
  fontWeight: '$5',
  fontFamily: '$roboto',
  paddingTop: '$8',
  marginBottom: '$4'
});

const createProjectSchema = Yup.object().shape({
  name: Yup.string().required('Enter a project name'),
  description: Yup.string().required('Enter a short description'),
  timezone: Yup.string().required('Select a timezone'),
  availableMLModels: Yup.string().required('Select a ML model'),
});

const CreateProjectForm = () => {
  const tzOptions = timeZonesNames.map((tz) => ({ value: tz, label: tz }));
  const mlModelOptions = [
    {value: 'megadetector_v5a', label: 'megadetector_v5a'},
    {value: 'megadetector_v5b', label: 'megadetector_v5b'},
    {value: 'mirav2', label: 'mirav2'}
  ];

  return (
    <PageWrapper>
      <Header>Create project</Header>
      <FormWrapper>
        <Formik
          initialValues={{
            name: '',
            description: '',
            timezone: '',
            availableMLModels: ''
          }}
          validationSchema={createProjectSchema}
          onSubmit={(values) => console.log(values)}
        >
          {({ values, errors, isValid, touched, setFieldTouched, setFieldValue }) => (
            <Form>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='name'>Name</label>
                  <Field name='name' id='name'/>
                  {!!errors.name && touched.name && (
                    <FormError>
                      {errors.name}
                    </FormError>
                  )}
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='description'>Description</label>
                  <Field as="textarea" name='description' id='description'/>
                  {!!errors.description && touched.description && (
                    <FormError>
                      {errors.description}
                    </FormError>
                  )}
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name='timezone'
                    label='Timezone'
                    options={tzOptions}
                    value={tzOptions.find(({ value }) => value === values.timezone)}
                    touched={touched.timezone}
                    onChange={(name, { value }) => setFieldValue(name, value)}
                    onBlur={(name, { value }) => setFieldTouched(name, value)}
                    error={errors.timezone}
                  />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <SelectField
                    name='availableMLModels'
                    label='Available ML models'
                    options={mlModelOptions}
                    value={mlModelOptions.find(({ value }) => value === values.availableMLModels)}
                    touched={touched.availableMLModels}
                    onChange={(name, { value }) => setFieldValue(name, value)}
                    onBlur={(name, { value }) => setFieldTouched(name, value)}
                    error={errors.availableMLModels}
                  />
                </FormFieldWrapper>
              </FieldRow>
              <ButtonRow>
                <Button type='submit' size='large' disabled={!isValid}>
                  Save
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </PageWrapper>
  );
}

export default CreateProjectForm;
