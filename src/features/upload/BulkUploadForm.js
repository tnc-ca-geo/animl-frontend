import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { FormWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates } from './uploadSlice';

const bulkUploadSchema = Yup.object().shape({
  images_zip: Yup.mixed().required('File is required'),
});

const BulkUploadForm = ({ handleClose }) => {
  const { isLoading, progress }  = useSelector(selectUploadsLoading);
  const batchStates = useSelector(selectBatchStates);
  const percentUploaded = Math.round(progress * 100);
  const dispatch = useDispatch();

  const sortedBatchStates = useMemo(() => {
    const clonedStates = batchStates.slice();
    return clonedStates.sort((a, b) => parseInt(b.processingStart) - parseInt(a.processingStart))
  }, [batchStates]);

  const handleSubmit = (values) => dispatch(uploadFile({ file: values.images_zip }));

  useEffect(() => {
    dispatch(fetchBatches())
  }, [dispatch]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Process start</th>
            <th>Process end</th>
            <th>Total images</th>
            <th>Remaining images</th>
          </tr>
        </thead>
        <tbody>
          {sortedBatchStates.map(({ _id, eTag, processingStart, processingEnd, total, remaining }) => {
            const start = new Date(parseInt(processingStart)).toLocaleString();
            const end = processingEnd && new Date(parseInt(processingEnd)).toLocaleString();
            return (
              <tr key={_id}>
                <td>{eTag}</td>
                <td>{start}</td>
                <td>{end}</td>
                <td>{total}</td>
                <td>{remaining}</td>
              </tr>
            )}
          )}
        </tbody>
      </table>
      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ images_zip: null }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <h2>Upload new batch</h2>
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
