import React from 'react';
import { Formik, Form, Field } from 'formik';
import { FormWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';

const bulkUploadSchema = Yup.object().shape({
  images_zip: Yup.mixed().required('File is required'),
});

const BulkUploadForm = ({ handleClose }) => {
  const handleSubmit = () => {
    console.log('submitting')
  }

  return (
    <div>
      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ images_zip: '' }}
        >
          {({ errors, touched, values }) => (
            <Form>
              <HelperText>
                Upload a ZIP file containing images for bulk processing
              </HelperText>

              <Field
                type='file'
                name='images_zip'
                accept='.zip'
                value={values.images_zip}
              />
              {touched.images_zip && errors.images_zip && (
                <FormError>{ errors.images_zip }</FormError>
              )}

              <ButtonRow>
                <Button type='submit' size='large'>
                  Upload
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  )
}

export default BulkUploadForm;
