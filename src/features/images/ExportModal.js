import React, { useEffect }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  selectCSVExport,
  selectCSVExportLoading,
  exportCSV,
  getExportStatus,
} from '../images/imagesSlice';
import { selectActiveFilters  } from '../filters/filtersSlice.js';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import { ButtonRow, HelperText } from '../../components/Form';
import Button from '../../components/Button';
import Warning from '../../components/Warning';
import NoneFoundAlert from '../../components/NoneFoundAlert';

const StyledWarning = styled(Warning, {
  marginTop: '$0',
});

const NotReviewedWarning = ({ imageCount, reviewedCount }) => (
  <StyledWarning>
    {reviewedCount.notReviewed.toLocaleString('en-US')} of 
    the {imageCount.toLocaleString('en-US')} images that matched 
    the current filters still need review and were not included in the 
    export file.
  </StyledWarning>
);

const ExportModal = () => {
  const filters = useSelector(selectActiveFilters);
  const csvExport = useSelector(selectCSVExport);
  const CSVExportLoading = useSelector(selectCSVExportLoading);
  const dispatch = useDispatch();

  const exportReady = !CSVExportLoading.isLoading && 
                      !CSVExportLoading.errors && 
                      csvExport && 
                      csvExport.url;
  
  const exportPending = CSVExportLoading.isLoading && 
                        csvExport && 
                        csvExport.documentId;

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (exportReady) {
      window.open(csvExport.url, 'downloadTab');
    }
  }, [exportReady, csvExport, dispatch]);

  useEffect(() => {
    if (exportPending) {
      dispatch(getExportStatus(csvExport.documentId));
    }
  }, [exportPending, csvExport, dispatch])

  const handleExportCSVClick = () => {
    const { isLoading, errors, noneFound } = CSVExportLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      dispatch(exportCSV(filters));
    }
  };

  const handleExportCOCOClick = () => {
    // TODO: implement COCO Camera Traps export
  };

  return (
    <div>
      {CSVExportLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      {CSVExportLoading.noneFound &&
        <NoneFoundAlert>
          We couldn't find any images that matched this set of filters.
        </NoneFoundAlert>
      }
      <HelperText>
        <p>Reviewed images matching the current filters can be downloaded to 
        CSV or <a href="https://github.com/microsoft/CameraTraps/blob/main/data_management/README.md" target="_blank" rel="noreferrer">
        COCO Camera Traps</a> format. Any images that have not been reviewed 
        will be ignored.</p>
        {!exportReady && 
          <p><em>Note: if you are exporting 10's of thousands of 
          image records, this may take a few minutes.</em></p>
        }
        {exportReady && 
          <p><em>Note: if your download did not start automatically, 
          click <a href={csvExport.url} target="downloadTab">this link</a> to 
          initiate it.</em></p>
        }
      </HelperText>
      {(exportReady &&
        csvExport.reviewedCount &&
        csvExport.reviewedCount.notReviewed > 0) &&
          <NotReviewedWarning
            imageCount={csvExport.imageCount}
            reviewedCount={csvExport.reviewedCount}
          />
      }
      <ButtonRow>
        <Button 
          type='submit'
          size='large'
          disabled={true}
          onClick={() => handleExportCOCOClick()}
        >
          Export to COCO (coming soon!)
        </Button>
        <Button 
          type='submit'
          size='large'
          disabled={CSVExportLoading.isLoading}
          onClick={() => handleExportCSVClick()}
        >
          Export to CSV
        </Button>
      </ButtonRow>
    </div>
  );
};

export default ExportModal;

