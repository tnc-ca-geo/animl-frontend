import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { FormWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { uploadFile, selectUploadsLoading } from './projectsSlice';

const bulkUploadSchema = Yup.object().shape({
  images_zip: Yup.mixed().required('File is required'),
});

const BulkUploadForm = ({ handleClose }) => {
  const { isLoading, progress } = useSelector(selectUploadsLoading);
  const percentUploaded = Math.round(progress * 100);
  const dispatch = useDispatch();

  const handleSubmit = (values) => dispatch(uploadFile(values));

  return (
    <div>
      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ images_zip: null }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <HelperText>
                Upload a ZIP file containing images for bulk processing
              </HelperText>

              <input
                type='file'
                id='images_zip'
                name='images_zip'
                accept='.zip'
                onChange={(e) => setFieldValue('images_zip', e.target.files[0])}
              />
              {touched.images_zip && errors.images_zip && (
                <FormError>{ errors.images_zip }</FormError>
              )}

              {(isLoading || progress > 0) && (
                <ProgressBar aria-label="Upload progress" max="100" value={percentUploaded}>{percentUploaded}%</ProgressBar>
              )}

              <ButtonRow>
                <Button type='submit' size='large' disabled={isLoading}>
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
