import React, { useEffect }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  selectExport,
  selectExportLoading,
  exportData,
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

const ManualDocumentDownload = ({ urls, documentId }) => {
  console.log('urls: ', urls);
  let ret = (
    <p><em>Note: if your download did not start automatically, 
    click <a href={urls[0]} target="downloadTab">this link</a> to 
    initiate it.</em></p>
  );

  if (urls.length > 1) {
    ret = (
      <div>
        <p><em>Your export is ready. Click the links below to download the files:</em></p>
        <ul>{urls.map((url) => {
          const docName = url.split('/')[3].split('?')[0];
          return (
            <li key={url}>
              <a href={url} target="downloadTab">{docName}</a>
            </li>
          )
        })}
        </ul>
      </div>
    );
  }
  return ret;
};

const ExportModal = () => {
  const filters = useSelector(selectActiveFilters);
  const dataExport = useSelector(selectExport);
  const exportLoading = useSelector(selectExportLoading);
  const dispatch = useDispatch();

  console.log('dataExport: ', dataExport)

  const exportReady = !exportLoading.isLoading && 
                      !exportLoading.errors && 
                      dataExport && 
                      dataExport.urls;
  
  const exportPending = exportLoading.isLoading && 
                        dataExport && 
                        dataExport.documentId;

  // when we have a url for the exported file, open it
  useEffect(() => {
    if (exportReady && dataExport.urls === 1) {
      for (const url of dataExport.urls) {
        window.open(url, 'downloadTab');
      }
    }
  }, [exportReady, dataExport, dispatch]);

  useEffect(() => {
    if (exportPending) {
      dispatch(getExportStatus(dataExport.documentId));
    }
  }, [exportPending, dataExport, dispatch])

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
      {exportLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      {exportLoading.noneFound &&
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
          <ManualDocumentDownload 
            urls={dataExport.urls}
            documentId={dataExport.documentId}
          />
        }
      </HelperText>
      {(exportReady &&
        dataExport.reviewedCount &&
        dataExport.reviewedCount.notReviewed > 0) &&
          <NotReviewedWarning
            imageCount={dataExport.imageCount}
            reviewedCount={dataExport.reviewedCount}
          />
      }
      <ButtonRow>
        <Button 
          type='submit'
          size='large'
          disabled={exportLoading.isLoading}
          data-format='coco'
          onClick={handleExportButtonClick}
        >
          Export to COCO
        </Button>
        <Button 
          type='submit'
          size='large'
          disabled={exportLoading.isLoading}
          data-format='csv'
          onClick={handleExportButtonClick}
        >
          Export to CSV
        </Button>
      </ButtonRow>
    </div>
  );
};

export default ExportModal;

