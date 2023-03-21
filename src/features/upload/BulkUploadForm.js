import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { FormWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates } from './uploadSlice';
import { styled } from '@stitches/react';

const bulkUploadSchema = Yup.object().shape({
  images_zip: Yup.mixed().required('File is required'),
});

const Table = styled('table', {
  borderSpacing: '0',
})

const TableHead = styled('th', {
  textAlign: 'left',
  verticalAlign: 'bottom',
  padding: '5px 15px',
});

const TableRow = styled('tr', {
  '&:nth-child(odd)': {
    backgroundColor: '$backgroundDark',
  },
});

const TableCell = styled('td', {
  padding: '5px 15px',
  verticalAlign: 'top',
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
    // Initially loaded the batches
    dispatch(fetchBatches());

    // Update batches every minute
    const intervalID = setInterval(() => dispatch(fetchBatches()), 60000);
    return () => clearInterval(intervalID);
  }, [dispatch]);

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <TableHead>ID</TableHead>
            <TableHead>Process start</TableHead>
            <TableHead>Process end</TableHead>
            <TableHead>Total images</TableHead>
            <TableHead>Remaining images</TableHead>
          </tr>
        </thead>
        <tbody>
          {sortedBatchStates.map(({ _id, eTag, processingStart, processingEnd, total, remaining }) => {
            const start = new Date(parseInt(processingStart)).toLocaleString();
            const end = processingEnd && new Date(parseInt(processingEnd)).toLocaleString();
            return (
              <TableRow key={_id}>
                <TableCell>{eTag}</TableCell>
                <TableCell>{start}</TableCell>
                <TableCell>{end}</TableCell>
                <TableCell>{total}</TableCell>
                <TableCell>{remaining}</TableCell>
              </TableRow>
            )}
          )}
        </tbody>
      </Table>

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
