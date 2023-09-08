import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBatches, stopBatch, exportErrors, getErrorsExportStatus, filterBatches } from './uploadSlice';
import { selectBatchStates, selectBatchPageInfo, selectErrorsExport, selectErrorsExportLoading, selectBatchFilter } from './uploadSlice';
import { styled } from '@stitches/react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { violet, blackA, mauve } from '@radix-ui/colors';
import { TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon } from '@radix-ui/react-icons';
import { DateTime } from 'luxon';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton.jsx';
import { ChevronLeftIcon, ChevronRightIcon, Cross2Icon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Tooltip, TooltipContent, TooltipArrow, TooltipTrigger } from '../../components/Tooltip.jsx';


const Table = styled('table', {
  borderSpacing: '0',
  width: '100%',
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
    marginLeft: '10px'
  }
});

const BulkUploadActionButton = styled(Button, {
  marginRight: '$2'
});

const Status = styled('span');

const Error = styled('span', {
  color: 'red'
});


const BulkUploadTable = ({ percentUploaded }) => {
  const { hasNext, hasPrevious } = useSelector(selectBatchPageInfo);
  const batchStates = useSelector(selectBatchStates);
  const errorsExport = useSelector(selectErrorsExport);
  const errorsExportLoading = useSelector(selectErrorsExportLoading);
  const dispatch = useDispatch();

  // Fetch batches and continue to poll every minute
  useEffect(() => {
    dispatch(fetchBatches());
    const intervalID = setInterval(() => dispatch(fetchBatches()), 60000);
    return () => clearInterval(intervalID);
  }, [dispatch]);

  const sortedBatches = [];
  for (const batch of batchStates) {    
    if (!batch.uploadComplete) {
      sortedBatches.unshift(batch)
    } else {
      sortedBatches.push(batch)
    }
  }

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
      <CurrentCompletedToggle />
      <Table>
        <thead>
          <tr>
            <TableHeadCell>File name</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </tr>
        </thead>
        <tbody>
          {sortedBatches.map((batch) => {
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
    </div>
  )
};

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

const CurrentCompletedToggle = () => {
  const batchFilter = useSelector(selectBatchFilter);
  const dispatch = useDispatch();

  return (
    <ToggleGroupRoot
      type='single'
      value={batchFilter}
      aria-label='Filter current or completed uploads'
      onValueChange={(value) => {
        if (value) {
          dispatch(filterBatches(value));
          dispatch(fetchBatches())
        }
      }}
    >
      <ToggleGroupItem value='CURRENT' aria-label='Current uploads'>
        Current uploads
      </ToggleGroupItem>
      <ToggleGroupItem value='COMPLETED' aria-label='Completed uploads'>
        Completed uploads
      </ToggleGroupItem>
    </ToggleGroupRoot>
  )
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
  '&:hover': { backgroundColor: '$gray4', borderColor: '$gray4'},
  '&[data-state=on]': { 
    color: '$hiContrast',
    borderBottom: '2px solid',
    borderColor: '$hiContrast',
  }
});


export default BulkUploadTable;