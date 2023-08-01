import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormWrapper, FieldRow, FormFieldWrapper, ButtonRow, HelperText, FormError } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import ProgressBar from '../../components/ProgressBar';
import { selectSelectedProject } from '../projects/projectsSlice';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates, selectBatchPageInfo, stopBatch, exportErrors, selectErrorsExport, selectErrorsExportLoading, getErrorsExportStatus } from './uploadSlice';
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

const getStatus = (percentUploaded, batch) => {
  const { processingStart, processingEnd, total, remaining, errors } = batch;

  let status = `File successfully uploaded. Preparing images...`;
  if (percentUploaded !== 100) {
    status = `Uploading file...`
  }
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
  const errorsExport = useSelector(selectErrorsExport);
  const errorsExportLoading = useSelector(selectErrorsExportLoading);
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
  

  // TODO: a lot of this export logic is shared by the ExportModal,
  // so we should consider abstracting either into a component or hook
  const errorsExportReady = !errorsExportLoading.isLoading && 
    !errorsExportLoading.errors && 
    errorsExport && 
    errorsExport.url;

  const errorsExportPending = errorsExportLoading.isLoading && 
    errorsExport && 
    errorsExport.documentId;

  useEffect(() => {
    if (errorsExportPending) {
      dispatch(getErrorsExportStatus(errorsExport.documentId));
    }
  }, [errorsExportPending, errorsExport, dispatch]);

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (errorsExportReady) {
      window.open(errorsExport.url, 'downloadTab');
    }
  }, [errorsExportReady, errorsExport, dispatch]);

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
            console.log('batch to display: ', batch)
            const { _id, originalFile, processingEnd, total, remaining } = batch;
            const isStopable = !processingEnd && (remaining === null || total - remaining > 0);
            const status = getStatus(percentUploaded, batch);
            const hasErrors = true;

            return (
              <TableRow key={_id}>
                <TableCell>{originalFile}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>{isStopable && <Button size='small' onClick={() => dispatch(stopBatch(_id))}>Stop</Button>}</TableCell>
                <TableCell>{hasErrors && <Button size='small' onClick={() => dispatch(exportErrors({filters: { batch: _id }}))}>Get Errors</Button>}</TableCell>
              </TableRow>
            )}
          )}
        </tbody>
      </Table>
      <Pagination>
        {hasPrevious && <Button size='small' onClick={() => dispatch(fetchBatches('previous'))}>Previous page</Button>}
        {hasNext && <Button size='small' onClick={() => dispatch(fetchBatches('next'))}>Next page</Button>}
      </Pagination>
      {errorsExportReady && 
        <p><em>Success! Your export is ready for download. If the download 
        did not start automatically, click <a href={errorsExport.url} target="downloadTab">this link</a> to 
        initiate it.</em></p>
      }

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
