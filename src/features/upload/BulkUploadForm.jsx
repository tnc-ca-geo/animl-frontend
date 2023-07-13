import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormWrapper, FieldRow, FormFieldWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { selectSelectedProject } from '../projects/projectsSlice';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates, selectBatchPageInfo, stopBatch } from './uploadSlice';
import { styled } from '@stitches/react';


const bulkUploadSchema = Yup.object().shape({
  zipFile: Yup.mixed()
    .required('A ZIP file is required')
    .test('fileSize', 'The file must be smaller than 50GB.', (value) => {
      if (!value) return true;
      return value.size <= Math.pow(1024, 3) * 50;
    }),
  // TODO: improve SN override validation (no spaces, special characters, and all lowercase)
  overrideSerial: Yup.string()
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

const Status = styled('span');
const Error = styled('span', {
  color: 'red'
});

const getStatus = (batch) => {
  const { processingStart, processingEnd, total, remaining, errors } = batch;

  let status = 'Queued';
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

  const error = errors?.length > 0 && <Error>{errors.length} error{errors?.length > 1 ? 's' : ''}.</Error>

  return <Status>{status} {error}</Status>;
}

const BulkUploadForm = ({ handleClose }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const { isLoading, progress }  = useSelector(selectUploadsLoading);
  const batchStates = useSelector(selectBatchStates);
  const { hasNext, hasPrevious } = useSelector(selectBatchPageInfo);
  const percentUploaded = Math.round(progress * 100);
  const dispatch = useDispatch();

  const sortedBatchStates = useMemo(() => {
    const clonedStates = batchStates.slice();
    return clonedStates
      .filter((batch) => batch.projectId === selectedProject._id)
      .sort((a, b) => parseInt(b.processingStart) - parseInt(a.processingStart))
  }, [batchStates]);

  const handleSubmit = (values) => {
    dispatch(uploadFile({ 
      file: values.zipFile, 
      overrideSerial: values.overrideSerial
    }));
  };

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
          {sortedBatchStates.map((batch) => {
            const { _id, originalFile, processingEnd, total, remaining } = batch
            const isStopable = !processingEnd && (remaining === null || total - remaining > 0);
            const status = getStatus(batch)

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
          initialValues={{ zipFile: null, overrideSerial: '' }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>

              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='overrideSerial'>Upload a ZIP file containing images</label>
                  <input
                    type='file'
                    id='zipFile'
                    name='zipFile'
                    accept='.zip'
                    onChange={(e) => setFieldValue('zipFile', e.target.files[0])}
                  />
                  <ErrorMessage component={FormError} name='zipFile'/>
                </FormFieldWrapper>
              </FieldRow>

              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='overrideSerial'>Serial Number Override</label>
                  <Field name='overrideSerial' id='overrideSerial' />
                  <ErrorMessage component={FormError} name='overrideSerial'/>
                </FormFieldWrapper>
              </FieldRow>

              {/*
              {touched.zipFile && errors.zipFile && (
                <FormError>{ errors.zipFile }</FormError>
              )}
              */}

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
