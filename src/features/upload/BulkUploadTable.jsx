import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBatches,
  stopBatch,
  filterBatches,
  selectStopBatchLoading,
  selectRedriveBatchLoading,
  redriveBatch,
  selectBatchStatesLoading,
  selectBatchStates,
  selectBatchPageInfo,
  selectBatchFilter,
} from './uploadSlice';
import {
  exportErrors,
  fetchTask,
  selectErrorsExport,
  selectErrorsExportLoading,
} from '../tasks/tasksSlice.js';
import { styled, keyframes } from '@stitches/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { DateTime } from 'luxon';
import IconButton from '../../components/IconButton.jsx';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';

const Table = styled('table', {
  borderSpacing: '0',
  borderCollapse: 'collapse',
  width: '100%',
  tableLayout: 'fixed',
  marginBottom: '15px',
  // borderBottom: '1px solid',
  // borderColor: '$border',
});

const TableHeadCell = styled('th', {
  color: '$textMedium',
  fontSize: '$2',
  fontWeight: '400',
  textTransform: 'uppercase',
  textAlign: 'left',
  verticalAlign: 'bottom',
  padding: '5px 15px',
  borderBottom: '1px solid',
  borderTop: '1px solid',
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
    marginLeft: '10px',
  },
});

const ellipsis = keyframes({
  '100%': { width: '1em;' },
});

const StatusMessage = styled('span', {
  variants: {
    loading: {
      true: {
        '&:after': {
          overflow: 'hidden',
          display: 'inline-block',
          verticalAlign: 'bottom',
          animation: `${ellipsis} steps(4,end) 1.2s infinite`,
          content: '\u2026',
          width: '0px',
        },
      },
    },
  },
});

const Error = styled('span', {
  color: 'red',
});

const BulkUploadTable = ({ percentUploaded }) => {
  const { hasNext, hasPrevious } = useSelector(selectBatchPageInfo);
  const batchStates = useSelector(selectBatchStates);
  const batchStatesLoading = useSelector(selectBatchStatesLoading);
  const errorsExport = useSelector(selectErrorsExport);
  const errorsExportLoading = useSelector(selectErrorsExportLoading);
  const stopBatchLoading = useSelector(selectStopBatchLoading);
  const redriveBatchLoading = useSelector(selectRedriveBatchLoading);

  const dispatch = useDispatch();

  // Fetch batches and continue to poll every 30 seconds
  useEffect(() => {
    dispatch(fetchBatches());
    const intervalID = setInterval(() => dispatch(fetchBatches()), 30000);
    return () => clearInterval(intervalID);
  }, [dispatch]);

  const sortedBatches = [];
  for (const batch of batchStates) {
    if (!batch.uploadComplete) {
      sortedBatches.unshift(batch);
    } else {
      sortedBatches.push(batch);
    }
  }

  // TODO: a lot of this export logic is shared by the ExportModal,
  // so we should consider abstracting either into a component or hook
  const errorsExportReady =
    !errorsExportLoading.isLoading &&
    !errorsExportLoading.errors &&
    errorsExport &&
    errorsExport.url;

  const handleExportButtonClick = (e, _id) => {
    const { isLoading, errors, noneFound } = errorsExportLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      dispatch(exportErrors({ filters: { batch: _id } }));
    }
  };

  useEffect(() => {
    const errorsExportPending = errorsExportLoading.isLoading && errorsExportLoading.taskId;
    if (errorsExportPending) {
      dispatch(fetchTask(errorsExportLoading.taskId));
    }
  }, [errorsExportLoading, dispatch]);

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (errorsExportReady) {
      window.open(errorsExport.url, 'downloadTab');
    }
  }, [errorsExportReady, errorsExport, dispatch]);

  return (
    <div style={{ position: 'relative' }}>
      {batchStatesLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <CurrentPastToggle />
      <Table>
        <thead>
          <tr>
            <TableHeadCell css={{ width: '35%' }}>File name</TableHeadCell>
            <TableHeadCell css={{ width: '45%' }}>Status</TableHeadCell>
            <TableHeadCell css={{ width: '20%' }}>Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {sortedBatches.map((batch) => {
            const { _id, originalFile } = batch;
            const status = getStatus(percentUploaded, batch);
            const statusMsg = getStatusMessage(status, batch);
            const isRedrivingImages =
              redriveBatchLoading.batch === _id && redriveBatchLoading.isLoading;
            const isFetchingErrors =
              errorsExportLoading.batch === _id && errorsExportLoading.isLoading;
            const isStoppingBatch =
              (stopBatchLoading.batch === _id && stopBatchLoading.isLoading) ||
              (status['stop-initiated'] && !status['stack-destroyed']);
            const isStopable =
              !status['uploading-file'] &&
              !status['processing-complete'] &&
              !status['stop-initiated'] &&
              !status['stack-destroyed'];

            return (
              <TableRow key={_id}>
                <TableCell>{originalFile}</TableCell>
                <TableCell>
                  <div>
                    {statusMsg}
                    {status['has-batch-errors'] && (
                      <Error>
                        {batch.errors.length} error{batch.errors?.length > 1 ? 's' : ''}.
                      </Error>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant="ghost"
                        state={isStoppingBatch && 'loading'}
                        size="large"
                        disabled={!isStopable}
                        onClick={() => dispatch(stopBatch(_id))}
                      >
                        <Cross2Icon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      Cancel image processing
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant="ghost"
                        state={isFetchingErrors && 'loading'}
                        size="large"
                        css={{ color: '$errorText' }}
                        disabled={
                          !status['processing-complete'] ||
                          !batch.imageErrors ||
                          batch.imageErrors === 0
                        }
                        onClick={(e) => handleExportButtonClick(e, _id)}
                      >
                        <ExclamationTriangleIcon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      Download errors CSV
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconButton
                        variant="ghost"
                        state={isRedrivingImages && 'loading'}
                        size="large"
                        css={{ color: '$errorText' }}
                        disabled={!(status['processing-complete'] && status['has-failed-images'])}
                        onClick={() => dispatch(redriveBatch(_id))}
                      >
                        <ReloadIcon />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      Reprocess failed images
                      <TooltipArrow />
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
      <Pagination>
        <IconButton
          variant="ghost"
          size="large"
          disabled={!hasPrevious}
          onClick={() => dispatch(fetchBatches('previous'))}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          variant="ghost"
          size="large"
          disabled={!hasNext}
          onClick={() => dispatch(fetchBatches('next'))}
        >
          <ChevronRightIcon />
        </IconButton>
      </Pagination>
      {errorsExportReady && (
        <p>
          <em>
            Your errors CSV is ready for download. If the download did not start automatically,
            click{' '}
            <a href={errorsExport.url} target="downloadTab">
              this link
            </a>{' '}
            to initiate it.
          </em>
        </p>
      )}
    </div>
  );
};

const getStatus = (percentUploaded, batch) => {
  const {
    created,
    uploadComplete,
    ingestionComplete,
    processingStart,
    processingEnd,
    stoppingInitiated,
    remaining,
    dead,
    errors,
  } = batch;

  const batchCreated = DateTime.fromISO(created);
  const now = DateTime.now();
  const durationSinceBatchCreated = now.diff(batchCreated);

  return {
    'uploading-file': percentUploaded > 0 && percentUploaded < 100 && !uploadComplete,
    'validating-file': !uploadComplete && !processingStart,
    'deploying-stack': uploadComplete && !processingStart, // not sure we need this
    'saving-images': processingStart && !ingestionComplete,
    'processing-images': processingStart && ingestionComplete ? true : false, // this overlaps w/ saving images (batch will be in both states for a bit)
    'processing-complete': processingStart && ingestionComplete && remaining === 0,
    'stop-initiated': stoppingInitiated ? true : false,
    'stack-destroyed': processingEnd ? true : false, // not sure we need this either
    'has-batch-errors': errors?.length > 0,
    'has-failed-images': dead > 0,
    'failed-to-upload':
      !percentUploaded &&
      !uploadComplete &&
      !processingStart &&
      durationSinceBatchCreated.as('minutes') > 480, // if we haven't started processing images in 8 hours
  };
};

const getStatusMessage = (status, batch) => {
  const { processingStart, total, remaining, dead, stoppingInitiated } = batch;
  let statusMsg = ``;
  let loading = true;
  if (status['uploading-file']) {
    statusMsg = `Uploading file`;
  } else if (status['validating-file']) {
    statusMsg = `Validating file`;
  }
  if (status['deploying-stack']) {
    statusMsg = `File successfully uploaded. Provisioning processing resources`;
  }
  if (status['saving-images']) {
    statusMsg = `Saving images`;
  }
  if (status['processing-images']) {
    statusMsg = `Processing images. Finished ${total - remaining} of ${total} images`;
  }
  if (status['processing-complete']) {
    statusMsg = `Finished processing images. Cleaning up`;
  }
  if (status['stop-initiated']) {
    statusMsg = `Cancelling image processing`;
  }
  if (status['processing-complete'] && status['has-failed-images']) {
    loading = false;
    statusMsg = `${total - dead} images were processed successfully, but ${dead} failed`;
  }
  if (status['stack-destroyed']) {
    loading = false;
    const dateString = DateTime.fromISO(processingStart).toLocaleString(DateTime.DATETIME_SHORT);
    statusMsg = `Processing of ${total} images finished at ${dateString}`;
  }
  if (status['stack-destroyed'] && status['stop-initiated']) {
    loading = false;
    const dateString = DateTime.fromISO(stoppingInitiated).toLocaleString(DateTime.DATETIME_SHORT);
    statusMsg = `Processing was cancelled at ${dateString}`;
  }
  if (status['failed-to-upload']) {
    loading = false;
    statusMsg = `Your file to failed to upload. Please try again.`;
  }
  return <StatusMessage loading={loading}>{statusMsg}</StatusMessage>;
};

const CurrentPastToggle = () => {
  const batchFilter = useSelector(selectBatchFilter);
  const dispatch = useDispatch();

  return (
    <ToggleGroupRoot
      type="single"
      value={batchFilter}
      aria-label="Filter current or past uploads"
      onValueChange={(value) => {
        if (value) {
          dispatch(filterBatches(value));
          dispatch(fetchBatches());
        }
      }}
    >
      <ToggleGroupItem value="CURRENT" aria-label="Current uploads">
        Current uploads
      </ToggleGroupItem>
      <ToggleGroupItem value="COMPLETED" aria-label="Past uploads">
        Past uploads
      </ToggleGroupItem>
    </ToggleGroupRoot>
  );
};

const ToggleGroupRoot = styled(ToggleGroup.Root, {
  display: 'inline-flex',
  borderRadius: 4,
});

const ToggleGroupItem = styled(ToggleGroup.Item, {
  all: 'unset',
  color: '$textMedium',
  height: 35,
  width: 140,
  display: 'flex',
  fontSize: '$3',
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '2px solid',
  borderColor: '$gray2',
  '&:first-child': { marginLeft: 0 },
  '&:hover': { backgroundColor: '$gray4', borderColor: '$gray4' },
  '&[data-state=on]': {
    color: '$hiContrast',
    borderBottom: '2px solid',
    borderColor: '$hiContrast',
  },
});

export default BulkUploadTable;
