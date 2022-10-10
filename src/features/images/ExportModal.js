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

const NoneFoundAlert = styled('div', {
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray600',
});

const NotReviewedWarning = ({ imageCount, reviewedCount }) => (
  <Warning>
    {reviewedCount.notReviewed} of the {imageCount} images that matched 
    the current filters still need review and were not included in the 
    export file.
  </Warning>
);

const ExportModal = () => {
  const filters = useSelector(selectActiveFilters);
  const csvExport = useSelector(selectCSVExport);
  const CSVExportLoading = useSelector(selectCSVExportLoading);
  const dispatch = useDispatch();

  console.log('csvExport: ', csvExport)

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (csvExport && csvExport.url) {
      console.log('opening presigned url: ', csvExport.url);
      window.open(csvExport.url, '_blank');
    }
  }, [csvExport, dispatch]);

  useEffect(() => {
    if (CSVExportLoading.isLoading && csvExport && csvExport.documentId) {
      console.log('dispatching getExportStatus')
      dispatch(getExportStatus(csvExport.documentId));
    }
  }, [CSVExportLoading.isLoading, csvExport, dispatch])

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
        The data matching the current filters can be downloaded to 
        CSV or <a href="https://github.com/microsoft/CameraTraps/blob/main/data_management/README.md" target="_blank" rel="noreferrer">
        COCO Camera Traps</a> format. Any images that have not been reviewed will be ignored.
      </HelperText>
      {(!CSVExportLoading.isLoading &&
        csvExport &&
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

