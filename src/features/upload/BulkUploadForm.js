import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import { FormWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates, selectBatchPageInfo, stopBatch } from './uploadSlice';
import { styled } from '@stitches/react';

const bulkUploadSchema = Yup.object().shape({
  images_zip: Yup.mixed().required('File is required'),
});

const Table = styled('table', {
  borderSpacing: '0',
  width: '100%',
  marginBottom: '15px'
})

const TableHeadCell = styled('th', {
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

const Pagination = styled('div', {
  textAlign: 'right',
  marginBottom: '30px',
  '& > button': {
    marginLeft: '10px'
  }
})

const BulkUploadForm = ({ handleClose }) => {
  const { isLoading, progress }  = useSelector(selectUploadsLoading);
  const batchStates = useSelector(selectBatchStates);
  const { hasNext, hasPrevious } = useSelector(selectBatchPageInfo);
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
            <TableHeadCell>File name</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {sortedBatchStates.map(({ _id, originalFile, processingStart, processingEnd, total, remaining }) => {
            let status = 'Queued'
            const isStopable = !processingEnd && (remaining === null || total - remaining > 0);

            if (processingStart) {
              const dateString = new Date(parseInt(processingStart)).toLocaleString();
              status = `Processing started at ${dateString}.`
              if (remaining !== null) {
                status = `${status} ${total ? `Finished ${total - remaining} of ${total} images.` : ''} ${total - remaining === 0 ? 'Wrapping up.' : ''}`
              }
            }
            if (processingEnd) {
              const dateString = new Date(parseInt(processingEnd)).toLocaleString();
              status = `Processing of ${total} images finished at ${dateString}.`
            }
            return (
              <TableRow key={_id}>
                <TableCell>{originalFile}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>{isStopable && <Button size='small' onClick={() => dispatch(stopBatch(_id))}>Stop</Button>}</TableCell>
              </TableRow>
            )}
          )}
        </tbody>
      </Table>
      <Pagination>
        {hasPrevious && <Button size='small' onClick={() => dispatch(fetchBatches('previous'))}>Previous page</Button>}
        {hasNext && <Button size='small' onClick={() => dispatch(fetchBatches('next'))}>Next page</Button>}
      </Pagination>

      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ images_zip: null }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              <HelperText>
                <b>Upload a ZIP file containing images for bulk processing</b>
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
