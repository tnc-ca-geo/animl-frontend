import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAnnotationsExport,
  selectAnnotationsExportLoading,
  exportAnnotations,
  fetchTask,
} from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { selectSelectedProject } from '../projects/projectsSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import SelectField from '../../components/SelectField.jsx';
import { ButtonRow, FormWrapper } from '../../components/Form';
import InfoIcon from '../../components/InfoIcon';
import Button from '../../components/Button';
import Callout from '../../components/Callout';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import { timeZonesNames } from '@vvo/tzdb';
import Checkbox from '../../components/Checkbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';

const NotReviewedWarning = ({ reviewedCount }) => {
  const total = reviewedCount.notReviewed + reviewedCount.reviewed;
  return (
    <Callout type="info">
      <p>
        {reviewedCount.notReviewed.toLocaleString('en-US')} of the {total.toLocaleString('en-US')}{' '}
        images that matched the current filters <strong>still need review</strong> and were not
        included in the export file.
      </p>
    </Callout>
  );
};

const ExportModal = () => {
  const filters = useSelector(selectActiveFilters);
  const annotationsExport = useSelector(selectAnnotationsExport);
  const exportLoading = useSelector(selectAnnotationsExportLoading);
  const selectedProject = useSelector(selectSelectedProject);
  const tzOptions = timeZonesNames.map((tz) => ({ value: tz, label: tz }));
  const [timezone, setTimezone] = useState(selectedProject.timezone);
  const [includeNonReviewed, setIncludedNonReviewed] = useState(false);
  const [aggregateObjects, setAggregateObjects] = useState(false);

  const dispatch = useDispatch();

  const exportReady =
    !exportLoading.isLoading && !exportLoading.errors && annotationsExport && annotationsExport.url;

  // when we have a url for the exported CSV file, open it
  useEffect(() => {
    if (exportReady) {
      window.open(annotationsExport.url, 'downloadTab');
    }
  }, [exportReady, annotationsExport, dispatch]);

  const exportPending = exportLoading.isLoading && exportLoading.taskId;
  useEffect(() => {
    if (exportPending) {
      dispatch(fetchTask(exportLoading.taskId));
    }
  }, [exportPending, exportLoading, dispatch]);

  const handleIncludeNonReviewedChange = () => {
    setIncludedNonReviewed(!includeNonReviewed);
  };

  const handleAggregateObjectsChange = () => {
    setAggregateObjects(!aggregateObjects);
  };

  const handleExportButtonClick = (e) => {
    const { isLoading, errors, noneFound } = exportLoading;
    const noErrors = !errors || errors.length === 0;
    if (!noneFound && !isLoading && noErrors) {
      const format = e.target.dataset.format;
      dispatch(
        exportAnnotations({ format, filters, timezone, includeNonReviewed, aggregateObjects }),
      );
    }
  };

  const IncludeNonReviewedToolTip = () => (
    <div style={{ maxWidth: '400px' }}>
      If an object hasn&apos;t been reviewed and validated by a human, the most recently added
      label/prediction will be used as the &quot;representative label&quot; for the analyses. Animl
      assumes the most recent label is the most specific and accurate label available.
    </div>
  );

  const AggregateObjectsToolTip = () => (
    <div style={{ maxWidth: '400px' }}>
      If an object hasn&apos;t been reviewed and validated by a human, the most recently added
      label/prediction will be used as the &quot;representative label&quot; for the analyses. Animl
      assumes the most recent label is the most specific and accurate label available.
    </div>
  );

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
      <div>
        <p style={{ marginTop: '0' }}>
          Annotations from images matching the current filters can be downloaded to CSV or{' '}
          <a
            href="https://github.com/microsoft/CameraTraps/blob/main/data_management/README.md"
            target="_blank"
            rel="noreferrer"
          >
            COCO Camera Traps
          </a>{' '}
          format.
        </p>
        {!exportReady && (
          <Callout type="info" title="Please bear with us!">
            <p>
              <em>
                If you are exporting 10&apos;s of thousands of image records, this may take a few
                minutes.
              </em>
            </p>
          </Callout>
        )}
        {exportReady && (
          <Callout type="success" title="Export successsful">
            <p>
              <em>
                Your export is ready for download. If the download did not start automatically,
                click{' '}
                <a href={annotationsExport.url} target="downloadTab">
                  this link
                </a>{' '}
                to initiate it.
              </em>
            </p>
          </Callout>
        )}
        {exportReady &&
          !includeNonReviewed &&
          annotationsExport.meta.reviewedCount &&
          annotationsExport.meta.reviewedCount.notReviewed > 0 && (
            <NotReviewedWarning reviewedCount={annotationsExport.meta.reviewedCount} />
          )}
      </div>

      <FormWrapper>
        <br />
        <SelectField
          name="timezone"
          label="Export to timezone"
          options={tzOptions}
          value={tzOptions.find(({ value }) => value === timezone)}
          onChange={(_, { value }) => setTimezone(value)}
          isMulti={false}
          onBlur={() => {}}
          maxMenuHeight={200}
        />
        <br />
        <label style={{ display: 'flex', flexDirection: 'row' }}>
          <Checkbox
            checked={includeNonReviewed}
            active={includeNonReviewed}
            onChange={handleIncludeNonReviewedChange}
          />
          <CheckboxLabel
            checked={false}
            active={false}
            css={{
              fontFamily: '$roboto',
              fontWeight: '$3',
              fontSize: '$3',
              color: '$hiContrast',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Include non-reviewed objects
            <InfoIcon tooltipContent={<IncludeNonReviewedToolTip />} />
          </CheckboxLabel>
        </label>
        <label style={{ display: 'flex', flexDirection: 'row' }}>
          <Checkbox
            checked={aggregateObjects}
            active={aggregateObjects}
            onChange={handleAggregateObjectsChange}
          />
          <CheckboxLabel
            checked={false}
            active={false}
            css={{
              fontFamily: '$roboto',
              fontWeight: '$3',
              fontSize: '$3',
              color: '$hiContrast',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Aggregate objects at image-level (CSV only)
            <InfoIcon tooltipContent={<AggregateObjectsToolTip />} />
          </CheckboxLabel>
        </label>
      </FormWrapper>
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
