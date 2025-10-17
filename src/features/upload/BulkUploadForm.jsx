import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {
  FormWrapper,
  FieldRow,
  FormFieldWrapper,
  ButtonRow,
  FormError,
  FileUploadInput,
} from '../../components/Form';
import * as Yup from 'yup';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import {
  Alert,
  AlertPortal,
  AlertOverlay,
  AlertContent,
  AlertTitle,
} from '../../components/AlertDialog';
import Callout from '../../components/Callout';
import * as Progress from '@radix-ui/react-progress';
import { fetchAutomationRules, selectAutomationRules } from '../projects/projectsSlice';
import { Cross2Icon } from '@radix-ui/react-icons';
import { green, red } from '@radix-ui/colors';
import { uploadFile, uploadMultipartFile, selectUploadsLoading } from './uploadSlice';
import { styled } from '@stitches/react';
import InfoIcon from '../../components/InfoIcon';
import BulkUploadTable from './BulkUploadTable.jsx';

const bulkUploadSchema = Yup.object().shape({
  zipFile: Yup.mixed()
    .required('A ZIP file is required')
    .test('is-valid-type', 'The file must be a .zip file', (value) => {
      if (!value) return true;
      return value.name.toLowerCase().split('.').pop() === 'zip';
    })
    .test('fileSize', 'The file must be smaller than 50GB.', (value) => {
      if (!value) return true;
      return value && value.size <= Math.pow(1024, 3) * 50;
    }),
  overrideSerial: Yup.string().matches(
    /^[a-zA-Z0-9_.-]*$/,
    "Serial Numbers can't contain spaces or special characters",
  ),
});

const FileUpload = styled('div', {
  position: 'relative',
});

const ProgressBar = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$4',
});

const ProgressTicker = styled('div', {
  color: '$textMedium',
  fontSize: '$3',
  marginLeft: '$2',
  textAlign: 'right',
  width: 120,
});

const ProgressRoot = styled(Progress.Root, {
  position: 'relative',
  overflow: 'hidden',
  background: '$backgroundDark',
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
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

const ClearFileButton = styled(IconButton, {
  position: 'absolute',
  right: 0,
  top: '12px',
  margin: '0 $2 0 $2',
});

const SNOverrideContent = styled('div', {
  maxWidth: '300px',
});

const SerialNumberOverrideHelp = () => (
  <SNOverrideContent>
    Using this feature will override the Camera Serial Numbers of all images in your Zip file. Be
    sure to understand the implications and read the{' '}
    <a
      href="https://docs.animl.camera/fundamentals/uploading-images#overriding-serial-numbers"
      target="_blank"
      rel="noopener noreferrer"
    >
      documentation
    </a>{' '}
    before use.
  </SNOverrideContent>
);

const BulkUploadForm = () => {
  const { isLoading, progress } = useSelector(selectUploadsLoading);
  const percentUploaded = Math.round(progress * 100);
  const [alertOpen, setAlertOpen] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const dispatch = useDispatch();
  const automationRules = useSelector(selectAutomationRules);
  const hasImageAddedAutoRule = automationRules.some(
    (rule) => rule.event.type === 'image-added' && rule.action.type === 'run-inference');

  useEffect(() => {
    dispatch(fetchAutomationRules());
  }, []);

  const upload = (values) => {
    const fileSize = values.zipFile.size;
    if (fileSize / (1024 * 1024) > 100) {
      // file is over 100 MB limit; initiate multi-part upload
      console.log('file is over 100 MB');
      dispatch(
        uploadMultipartFile({
          file: values.zipFile,
          overrideSerial: values.overrideSerial,
        }),
      );
    } else {
      // else initiate single-part upload
      console.log('file is under 100 MB');
      dispatch(
        uploadFile({
          file: values.zipFile,
          overrideSerial: values.overrideSerial,
        }),
      );
    }
  };

  const handleSubmit = (values) => {
    const warns = [];
    if (values.overrideSerial) warns.push('override-serial-set');
    if (!hasImageAddedAutoRule) warns.push('no-automation-rule');
    if (warns.length) {
      setWarnings(warns);
      setAlertOpen(true);
    } else {
      upload(values);
    }
  };

  const formikRef = useRef();
  const fileInputRef = useRef();
  const reset = () => {
    fileInputRef.current.value = null;
    formikRef.current?.resetForm();
  };
  useEffect(() => {
    if (percentUploaded === 100) {
      reset();
    }
  }, [percentUploaded, reset, dispatch]);

  return (
    automationRules && (<div>
      <FormWrapper>
        <Formik
          onSubmit={(values) => handleSubmit(values)}
          validationSchema={bulkUploadSchema}
          initialValues={{ zipFile: null, overrideSerial: '' }}
          innerRef={formikRef}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <FieldRow css={{ paddingBottom: 0 }}>
                <FormFieldWrapper>
                  <label htmlFor="overrideSerial">Upload a ZIP file containing images</label>
                  <FileUpload>
                    <FileUploadInput
                      ref={fileInputRef}
                      type="file"
                      id="zipFile"
                      name="zipFile"
                      accept=".zip"
                      onChange={(e) => setFieldValue('zipFile', e.target.files[0])}
                    />
                    <ClearFileButton
                      variant="ghost"
                      disabled={!values.zipFile || isLoading}
                      onClick={reset}
                    >
                      <Cross2Icon />
                    </ClearFileButton>
                  </FileUpload>
                  <ErrorMessage component={FormError} name="zipFile" />
                </FormFieldWrapper>

                <FormFieldWrapper>
                  <label htmlFor="overrideSerial">
                    Serial number override
                    <InfoIcon tooltipContent={<SerialNumberOverrideHelp />} />
                  </label>

                  <Field
                    name="overrideSerial"
                    id="overrideSerial"
                    placeholder="Optional. Read the docs and use with caution!"
                  />
                  <ErrorMessage component={FormError} name="overrideSerial" />
                </FormFieldWrapper>

                <ButtonRow css={{ padding: 0, margin: '0 0 $3 $3', alignItems: 'start' }}>
                  <Button
                    css={{ height: '55px', marginTop: '28px' }}
                    type="submit"
                    size="large"
                    disabled={isLoading || !values.zipFile}
                  >
                    Upload
                  </Button>
                </ButtonRow>
              </FieldRow>

              <ProgressBar css={{ opacity: isLoading ? 1 : 0 }}>
                <ProgressRoot>
                  <ProgressIndicator
                    css={{ transform: `translateX(-${100 - percentUploaded}%)` }}
                  />
                </ProgressRoot>
                <ProgressTicker>{percentUploaded}% Uploaded</ProgressTicker>
              </ProgressBar>
            </Form>
          )}
        </Formik>
      </FormWrapper>
      <BulkUploadTable percentUploaded={percentUploaded} />
      <UploadAlert
        open={alertOpen}
        setAlertOpen={setAlertOpen}
        formValues={formikRef.current?.values}
        upload={upload}
        warnings={warnings}
      />
    </div>)
  );
};

const alertContent = {
  'override-serial-set': {
    title: 'Serial Number Override Set',
    type: 'info',
    body: (
      <p>
        You&apos;ve included a camera Serial Number Override in your upload.{' '}
        <strong>
          Setting the Serial Number Override will override the serial number for ALL images in this
          ZIP file
        </strong>
        , so proceed with caution. For more information on the implications of using this feature,
        please refer to the{' '}
        <a
          href="https://docs.animl.camera/fundamentals/uploading-images#overriding-serial-numbers"
          target="_blank"
          rel="noopener noreferrer"
        >
          Animl Documentation
        </a>
        .
      </p>
    ),
  },
  'no-automation-rule': {
    title: 'No Automation Rules Configured',
    type: 'warning',
    body: (
      <p>
        There are currently no machine learning automation rules configured to trigger when new
        images are added to this Project, so if you proceed, images in this ZIP will be saved, but
        the upload will not trigger any machine learning predictions. To learn more about how to
        configure machine learning pipelines using Automation Rules, please refer to the{' '}
        <a
          href="https://docs.animl.camera/fundamentals/automation-rules"
          target="_blank"
          rel="noopener noreferrer"
        >
          Animl Documentation
        </a>
        .
      </p>
    ),
  },
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
        <AlertOverlay />
        <AlertContent>
          <AlertTitle>Are you sure you&apos;d like to proceed with this upload?</AlertTitle>
          {warnings &&
            warnings.map((warn) => {
              return (
                <Callout key={warn} type={alertContent[warn].type} title={alertContent[warn].title}>
                  {alertContent[warn].body}
                </Callout>
              );
            })}
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <Button size="small" css={{ border: 'none' }} onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              size="small"
              css={{
                backgroundColor: red.red4,
                color: red.red11,
                border: 'none',
                '&:hover': { color: red.red11, backgroundColor: red.red5 },
              }}
              onClick={handleConfirmUpload}
            >
              Yes, begin upload
            </Button>
          </div>
        </AlertContent>
      </AlertPortal>
    </Alert>
  );
};

export default BulkUploadForm;
