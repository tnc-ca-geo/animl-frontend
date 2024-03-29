import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { selectExport, selectExportLoading, exportData, fetchTask } from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { ButtonRow, HelperText } from '../../components/Form';
import Button from '../../components/Button';
import Warning from '../../components/Warning';
import NoneFoundAlert from '../../components/NoneFoundAlert';

const StyledWarning = styled(Warning, {
  marginTop: '$0',
});

const NotReviewedWarning = ({ reviewedCount }) => {
  const total = reviewedCount.notReviewed + reviewedCount.reviewed;
  return (
    <StyledWarning>
      {reviewedCount.notReviewed.toLocaleString('en-US')} of the {total.toLocaleString('en-US')}{' '}
      images that matched the current filters still need review and were not included in the export
      file.
    </StyledWarning>
  );
};

const ExportModal = () => {
  const filters = useSelector(selectActiveFilters);
  const dataExport = useSelector(selectExport);
  const exportLoading = useSelector(selectExportLoading);
  const dispatch = useDispatch();

  const exportReady =
    !exportLoading.isLoading && !exportLoading.errors && dataExport && dataExport.url;

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (exportReady) {
      window.open(dataExport.url, 'downloadTab');
    }
  }, [exportReady, dataExport, dispatch]);

  const exportPending = exportLoading.isLoading && exportLoading.taskId;
  useEffect(() => {
    if (exportPending) {
      dispatch(fetchTask(exportLoading.taskId));
    }
  }, [exportPending, exportLoading, dispatch]);

  const handleExportButtonClick = (e) => {
    const { isLoading, errors, noneFound } = exportLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      const format = e.target.dataset.format;
      dispatch(exportData({ format, filters }));
    }
  };

  return (
    <div>
      {exportLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {exportLoading.noneFound && (
        <NoneFoundAlert>
          We couldn&apos;t find any images that matched this set of filters.
        </NoneFoundAlert>
      )}
      <HelperText>
        <p>
          Reviewed images matching the current filters can be downloaded to CSV or{' '}
          <a
            href="https://github.com/microsoft/CameraTraps/blob/main/data_management/README.md"
            target="_blank"
            rel="noreferrer"
          >
            COCO Camera Traps
          </a>{' '}
          format. Any images that have not been reviewed will be ignored.
        </p>
        {!exportReady && (
          <p>
            <em>
              Note: if you are exporting 10&apos;s of thousands of image records, this may take a
              few minutes.
            </em>
          </p>
        )}
        {exportReady && (
          <p>
            <em>
              Success! Your export is ready for download. If the download did not start
              automatically, click{' '}
              <a href={dataExport.url} target="downloadTab">
                this link
              </a>{' '}
              to initiate it.
            </em>
          </p>
        )}
      </HelperText>
      {exportReady &&
        dataExport.meta.reviewedCount &&
        dataExport.meta.reviewedCount.notReviewed > 0 && (
          <NotReviewedWarning reviewedCount={dataExport.meta.reviewedCount} />
        )}
      <ButtonRow>
        <Button
          type="submit"
          size="large"
          disabled={exportLoading.isLoading}
          data-format="coco"
          onClick={handleExportButtonClick}
        >
          Export to COCO
        </Button>
        <Button
          type="submit"
          size="large"
          disabled={exportLoading.isLoading}
          data-format="csv"
          onClick={handleExportButtonClick}
        >
          Export to CSV
        </Button>
      </ButtonRow>
    </div>
  );
};

export default ExportModal;
