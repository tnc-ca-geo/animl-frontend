import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectActiveFilters } from '../../filters/filtersSlice.js';
import {
  fetchIndependentDetectionStats,
  fetchTask,
  selectIndependentDetectionStatsLoading,
  selectIndependentDetectionStats,
} from '../../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner.jsx';
import NoneFoundAlert from '../../../components/NoneFoundAlert.jsx';
import ReviewCount from './ReviewCount.jsx';
import GraphCard from './GraphCard.jsx';

const IndependentDetectionsPanel = ({ independenceInterval = 30 }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);

  const independentDetectionStats = useSelector(selectIndependentDetectionStats);
  const independentDetectionStatsLoading = useSelector(selectIndependentDetectionStatsLoading);

  useEffect(() => {
    const { isLoading, errors, noneFound } = independentDetectionStatsLoading;
    const noErrors = !errors || errors.length === 0;
    if (independentDetectionStats === null && !noneFound && !isLoading && noErrors) {
      dispatch(fetchIndependentDetectionStats(filters, independenceInterval));
    }
  }, [independentDetectionStats, independentDetectionStatsLoading, filters, dispatch, independenceInterval]);

  useEffect(() => {
    // Reload the stats data when the independence interval is updated
    if (independentDetectionStats !== null) {
      dispatch(fetchIndependentDetectionStats(filters, independenceInterval));
    }
  }, [independentDetectionStats, independenceInterval])

  useEffect(() => {
    const getStatsPending =
      independentDetectionStatsLoading.isLoading && independentDetectionStatsLoading.taskId;
    if (getStatsPending) {
      dispatch(fetchTask(independentDetectionStatsLoading.taskId));
    }
  }, [independentDetectionStatsLoading, dispatch]);

  if (independentDetectionStatsLoading.isLoading) {
    return (
      <SpinnerOverlay>
        <SimpleSpinner />
      </SpinnerOverlay>
    );
  }

  if (independentDetectionStatsLoading.noneFound) {
    return (
      <NoneFoundAlert>
        We couldn&apos;t find any images that matched this set of filters.
      </NoneFoundAlert>
    );
  }

  if (independentDetectionStats) {
    return (
      <>
        <ReviewCount
          label="Independent detections"
          count={independentDetectionStats.detectionsCount}
          countHint='Given the time window or "independence interval" selected above, after an animal triggers a camera, all occurrences of that same species within the independence interval are considered part of the same "independent detection". An occurrence of a species is defined here as an instance of an Object for which that species/label is its “Representative Label”.
This Independent Detection count value is the total number of independent detections that occurred in the currently filtered Images.'
        />
        {independentDetectionStats['detectionsLabelList'] &&
          Object.keys(independentDetectionStats['detectionsLabelList']).length !== 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
              <GraphCard
                label="Independent detections"
                list={independentDetectionStats.detectionsLabelList}
                content="The total number of Independent Detections of a given Label"
                dataKey="Number of Independent Detections of a given Label"
              />
            </div>
          )}
      </>
    );
  }

  return null;
};

export default IndependentDetectionsPanel;
