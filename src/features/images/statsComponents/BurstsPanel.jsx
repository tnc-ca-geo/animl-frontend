import { React, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectActiveFilters } from '../../filters/filtersSlice.js';
import {
  fetchBurstsStats,
  fetchTask,
  selectBurstsStatsLoading,
  selectBurstsStats,
} from '../../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner.jsx';
import NoneFoundAlert from '../../../components/NoneFoundAlert.jsx';
import ReviewCount from "./ReviewCount.jsx";
import GraphCard from "./GraphCard.jsx";

const BurstsPanel = ({ open }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);

  const burstsStats = useSelector(selectBurstsStats);
  const burstsStatsLoading = useSelector(selectBurstsStatsLoading);

  useEffect(() => {
    const { isLoading, errors, noneFound } = burstsStatsLoading;
    const noErrors = !errors || errors.length === 0;
    if (open && burstsStats === null && !noneFound && !isLoading && noErrors) {
      dispatch(fetchBurstsStats(filters));
    }
  }, [open, burstsStats, burstsStatsLoading, filters, dispatch]);

  useEffect(() => {
    const getStatsPending = burstsStatsLoading.isLoading && burstsStatsLoading.taskId;
    if (getStatsPending) {
      dispatch(fetchTask(burstsStatsLoading.taskId));
    }
  }, [burstsStatsLoading, dispatch]);

  if (burstsStatsLoading.isLoading) {
    return (
      <SpinnerOverlay>
        <SimpleSpinner />
      </SpinnerOverlay>
    );
  }

  if (burstsStatsLoading.noneFound) {
    return (
      <NoneFoundAlert>
        We couldn&apos;t find any images that matched this set of filters.
      </NoneFoundAlert>
    );
  }

  if (burstsStats) {
    return (
      <>
        <ReviewCount
          label="Bursts"
          count={burstsStats.burstCount}
          countHint='The total number of Bursts (images taken by a single camera within 2 seconds of one another) that match the current filters.'
        />
        {Object.keys(burstsStats['burstLabelList']).length !== 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <GraphCard
              label='Burst-level detections'
              list={burstsStats.burstLabelList}
              content='For each Label, the total number of Bursts matching the current filters that have at least one Object for which that Label is their “Representative Label”. For example, if you have 2 Bursts of 3 Images and all of the Images in each Burst contain multiple pigs, their burst-level detection count would still be 2.'
              dataKey='Number of Bursts that contain at least one Object with a given “Representative Label”'
            />
          </div>
        )}
      </>
    );
  }

  return null;
}

export default BurstsPanel;
