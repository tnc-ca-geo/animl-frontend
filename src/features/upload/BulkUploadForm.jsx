import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormWrapper, FieldRow, FormFieldWrapper, ButtonRow, HelperText, FormError, FileUploadInput } from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import ProgressBar from '../../components/ProgressBar';
import { Alert, AlertPortal, AlertOverlay, AlertTrigger, AlertContent, AlertTitle, AlertDescription, AlertCancel, AlertAction } from '../../components/AlertDialog';
import * as Progress from '@radix-ui/react-progress';
import { selectSelectedProject } from '../projects/projectsSlice';
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { green, red, mauve } from '@radix-ui/colors';
import { uploadFile, selectUploadsLoading, fetchBatches, selectBatchStates, selectBatchPageInfo, stopBatch, exportErrors, selectErrorsExport, selectErrorsExportLoading, getErrorsExportStatus, uploadProgress } from './uploadSlice';
import { styled } from '@stitches/react';
import { DateTime } from 'luxon';
import InfoIcon from '../../components/InfoIcon';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip.jsx';


const bulkUploadSchema = Yup.object().shape({
  zipFile: Yup.mixed()
    .required('A ZIP file is required')
    .test('fileSize', 'The file must be smaller than 50GB.', (value) => {
      if (!value) return true;
      return value && value.size <= Math.pow(1024, 3) * 50;
    }),
  overrideSerial: Yup.string()
    .matches(/^[a-zA-Z0-9_.-]*$/, 'Serial Numbers can\'t contain spaces or special characters')
});

const Table = styled('table', {
  borderSpacing: '0',
  width: '100%',
  marginBottom: '15px',
  // borderBottom: '1px solid',
  // borderColor: '$border',
})

const TableHeadCell = styled('th', {
  color: '$textMedium',
  fontSize: '$2',
  fontWeight: '400',
  textTransform: 'uppercase',
  textAlign: 'left',
  verticalAlign: 'bottom',
  padding: '5px 15px',
  borderBottom: '1px solid',
  borderColor: '$border',
});

const TableRow = styled('tr', {
  '&:nth-child(odd)': {
    backgroundColor: '$backgroundDark',
  },
});

const TableCell = styled('td', {
  color: '$textDark',
  fontSize: '$3',
  fontWeight: '400',
  padding: '5px 15px',
  // borderBottom: '1px solid',
  // borderColor: mauve.mauve11,
});

const Pagination = styled('div', {
  textAlign: 'right',
  marginBottom: '30px',
  '& > button': {
    marginLeft: '10px'
  }
});

const BulkUploadActionButton = styled(Button, {
  marginRight: '$2'
});

const FileUpload = styled('div', {
  position: 'relative',
});

const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: '$gray6',//'white',
  borderRadius: '99999px',
  width: '100%',
  height: '8px',

  /* Fix overflow clipping in Safari */
  /* https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0 */
  transform: 'translateZ(0)',
});

const ProgressIndicator = styled(Progress.Indicator, {
  backgroundColor: green.green9, //sky.sky4, //'$blue600',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)'
});

const ClearFileButton = styled(IconButton, {
  position: 'absolute',
  right: 0,
  top: '12px',
  margin: '0 $2 0 $2',
});

const Status = styled('span');

const Error = styled('span', {
  color: 'red'
});

const getStatus = (percentUploaded, batch) => {
  const { uploadComplete, ingestionComplete, processingStart, processingEnd, total, remaining, errors } = batch;
  const status = {
    'uploading-file': percentUploaded > 0 && percentUploaded < 100,
    'validating-file': !uploadComplete && !processingStart,
    'deploying-stack': uploadComplete && !processingStart, // not sure we need this
    'saving-images': processingStart && !ingestionComplete,
    'processing-images': processingStart && ingestionComplete ? true : false,	// this overlaps w/ saving images (batch will be in both states for a bit)
    'processing-complete': processingStart && ingestionComplete && (remaining === 0),
    'stack-destroyed': processingEnd ? true : false, // not sure we need this either
    'has-batch-errors': errors?.length > 0,
  };
  console.log(`status of ${batch.originalFile}: `, status);

  let statusMsg = ``;
  if (status['uploading-file']) {
    statusMsg = `Uploading file...`;
  } else if (status['validating-file']) {
    statusMsg = `Validating file...`;
  }
  if (status['deploying-stack']) {
    statusMsg = `File successfully uploaded. Provisioning processing resources...`;
  }
  if (status['saving-images']) {
    statusMsg = `Saving images...`;
  }
  if (status['processing-images']) {
    statusMsg = `Processing images. Finished ${total - remaining} of ${total} images`;
  }
  if (status['processing-complete']) {
    statusMsg = `Finished processing images. Cleaning up...`;
  }
  if (status['stack-destroyed']) {
    statusMsg = `Finished processing images. Cleaning up...`;
  }
  if (status['stack-destroyed']) {
    const dateString = DateTime.fromISO(processingStart).toLocaleString(DateTime.DATETIME_SHORT);
    statusMsg = `Processing of ${total} images finished at ${dateString}`;
  }

  console.log(`status message: ${statusMsg}`);
  
  return (
    <Status>
      {statusMsg}
      {status['has-batch-errors'] && 
        <Error>{errors.length} error{errors?.length > 1 ? 's' : ''}.</Error>
      }
    </Status>
  );
};

const SerialNumberOverrideHelp = () => (
  <div>
    serial number help. For more info see <a href="https://docs.animl.camera" target='_blank' rel='noopener noreferrer'>docs</a>
  </div>
);

const BulkUploadForm = ({ handleClose }) => {
  const selectedProject = useSelector(selectSelectedProject);
  const { isLoading, progress }  = useSelector(selectUploadsLoading);
  const batchStates = useSelector(selectBatchStates);
  const { hasNext, hasPrevious } = useSelector(selectBatchPageInfo);
  const percentUploaded = Math.round(progress * 100);
  const errorsExport = useSelector(selectErrorsExport);
  const errorsExportLoading = useSelector(selectErrorsExportLoading);
  const [ alertOpen, setAlertOpen ] = useState(false);
  const [ warnings, setWarnings ] = useState([])
  const dispatch = useDispatch();
  const hasImageAddedAutoRule = selectedProject.automationRules.some((rule) => (
    rule.event.type === 'image-added' && rule.action.type === 'run-inference'
  ));

  console.log('most recent batch: ', batchStates[0]);

  const upload = (values) => {
    dispatch(uploadFile({ 
      file: values.zipFile, 
      overrideSerial: values.overrideSerial
    }));
  };

  const handleSubmit = (values) => {
    const warns = [];
    if (values.overrideSerial) warns.push('override-serial-set');
    if (!hasImageAddedAutoRule) warns.push('no-automation-rule');
    if (warns.length) {
      setWarnings(warns);
      setAlertOpen(true);
    }
    else {
      upload(values);
    }
  };

  const formikRef = useRef();
  const fileInputRef = useRef();
  const reset = () => {
    console.log('resetting form');
    fileInputRef.current.value = null;
    formikRef.current?.resetForm();
  };
  useEffect(() => {
    if (percentUploaded === 100) {
      console.log('upload complete');
      dispatch(uploadProgress({ progress: 0 }));
      reset();
    }
  }, [percentUploaded, reset, dispatch]);

  // Fetch batches and continue to poll every minute
  useEffect(() => {
    dispatch(fetchBatches());
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

  const handleExportButtonClick = (e, _id) => {
    const { isLoading, errors, noneFound } = errorsExportLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      dispatch(exportErrors({filters: { batch: _id }}));
    }
  };

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
      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ zipFile: null, overrideSerial: '' }}
          innerRef={formikRef}
        >
          {({ values, setFieldValue, resetForm }) => (
            <Form>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='overrideSerial'>Upload a ZIP file containing images</label>
                  <FileUpload>
                    <FileUploadInput
                      ref={fileInputRef}
                      type='file'
                      id='zipFile'
                      name='zipFile'
                      accept='.zip'
                      onChange={(e) => setFieldValue('zipFile', e.target.files[0])}
                    />
                    <ClearFileButton
                      variant='ghost'
                      disabled={!values.zipFile || isLoading}
                      onClick={reset}
                    >
                      <Cross2Icon />
                    </ClearFileButton>
                  </FileUpload>
                  <ErrorMessage component={FormError} name='zipFile'/>
                </FormFieldWrapper>
                
                <FormFieldWrapper>
                  <label htmlFor='overrideSerial'>
                    Serial number override
                    <InfoIcon tooltipContent={<SerialNumberOverrideHelp />}/>
                  </label>

                  <Field name='overrideSerial' id='overrideSerial' placeholder='Optional. Read the docs and use with caution!'/>
                  <ErrorMessage component={FormError} name='overrideSerial'/>
                </FormFieldWrapper>

                <ButtonRow css={{ 'padding': 0, 'margin': '0 0 $3 $3', 'alignItems': 'start' }}>
                  <Button 
                    css={{ 'height': '55px', 'marginTop': '28px' }}
                    type='submit' 
                    size='large' 
                    disabled={isLoading || !values.zipFile}
                  >
                    Upload
                  </Button>
                </ButtonRow>
              </FieldRow>

              {(progress > 0) && (
                <ProgressRoot>
                  <ProgressIndicator css={{ transform: `translateX(-${100 - percentUploaded}%)` }}/>
                </ProgressRoot>
              )}

            </Form>
          )}
        </Formik>
      </FormWrapper>
      <Table>
        <thead>
          <tr>
            <TableHeadCell>File name</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {batchStates.map((batch) => {
            // console.log('batch to display: ', batch)
            const { _id, originalFile, processingEnd, total, remaining } = batch;
            const isStopable = !processingEnd && (remaining === null || total - remaining > 0);
            const status = getStatus(percentUploaded, batch);

            return (
              <TableRow key={_id}>
                <TableCell>{originalFile}</TableCell>
                <TableCell>{status}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant='ghost'
                        size='large'
                        disabled={!isStopable}
                        onClick={() => dispatch(stopBatch(_id))}
                      >
                        <Cross2Icon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5} >
                      Cancel image processing
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant='ghost'
                        size='large'
                        css={{ color: '$errorText' }}
                        disabled={!batch.imageErrors || batch.imageErrors === 0}
                        onClick={(e) => handleExportButtonClick(e, _id)}
                      >
                        <ExclamationTriangleIcon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5} >
                      Download errors CSV
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )}
          )}
        </tbody>
      </Table>
      <Pagination>
        <IconButton
          variant='ghost'
          size='large'
          disabled={!hasPrevious}
          onClick={() => dispatch(fetchBatches('previous'))}
        >
          <ChevronLeftIcon/>
        </IconButton>
        <IconButton
          variant='ghost'
          size='large'
          disabled={!hasNext}
          onClick={() => dispatch(fetchBatches('next'))}
        >
          <ChevronRightIcon/>
        </IconButton>
      </Pagination>
      {errorsExportReady && 
        <p><em>Success! Your errors CSV is ready for download. If the download 
        did not start automatically, click <a href={errorsExport.url} target="downloadTab">this link</a> to 
        initiate it.</em></p>
      }
      <UploadAlert
        open={alertOpen}
        setAlertOpen={setAlertOpen}
        formValues={formikRef.current?.values}
        upload={upload}
        warnings={warnings}
      />
    </div>
  )
};

// TODO: break out into new file

const Warning = styled('div', {
  marginTop: '$2',
  marginBottom: '$3',
  padding: '$1 $3',
  color: '$textMedium',
  p: {
    marginTop: '$2',
  }
});

const WarningTitle = styled('div', {
  display: 'flex',
  alignItems: 'center',
  color: '$warningText',
  fontWeight: '500',
  marginTop: '$2',
  svg: {
    marginRight: '$2'
  }
});

const alertContent = {
  'override-serial-set': <p>You've included a camera Serial Number Override in your
      upload. Setting the Serial Number Override will override the serial 
      number for all images in this ZIP file, so proceed with caution. For more
      information on the implications of using this feature, please refer to the <a href="https://docs.animl.camera" target='_blank' rel='noopener noreferrer'>Animl Documentation</a>.
    </p>
  ,
  'no-automation-rule': <p>There are currently no machine learning automation rules 
      configured to trigger when new images are added to this Project, so if you proceed, images in  
      this ZIP will be saved, but the upload will not produce in any machine learning predictions. To learn more 
      about how to configure machine learning pipelines using Automation Rules, 
      please refer to the <a href="https://docs.animl.camera" target='_blank' rel='noopener noreferrer'>Animl Documentation</a>.
    </p>
};

const UploadAlert = ({ open, setAlertOpen, upload, formValues, warnings }) => {

  const handleConfirmUpload = () => {
    upload(formValues);
    setAlertOpen(false);
  };

  return (
    <Alert
      open={open}
      onOpenChange={(e) => {
        console.log('Upload alert onOpenChange firing: ', e); // TODO: do we need this?
      }}
    >
    <AlertPortal>
      <AlertOverlay/>
      <AlertContent>
        <AlertTitle>Are you sure you'd like to proceed with this upload?</AlertTitle>
        {warnings && warnings.map((warn) => (
          <Warning key={warn} >
            <WarningTitle><ExclamationTriangleIcon/>Warning</WarningTitle>
            {alertContent[warn]}
          </Warning>
        ))}
        <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
          <Button size='small' css={{ border: 'none' }} onClick={() => setAlertOpen(false)}>Cancel</Button>
          <Button
            size='small'
            css={{
              backgroundColor: red.red4,
              color: red.red11,
              border: 'none',
              '&:hover': { color: red.red11, backgroundColor: red.red5 }
            }} 
            onClick={handleConfirmUpload}
          >
            Yes, begin upload
          </Button>
        </div>
      </AlertContent>
    </AlertPortal>
  </Alert>
  )
};

export default BulkUploadForm;
