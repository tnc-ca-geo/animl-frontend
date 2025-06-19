import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchStats,
  fetchTask,
  selectStatsLoading,
  selectImagesStats,
} from '../../tasks/tasksSlice.js';
import { selectActiveFilters } from '../../filters/filtersSlice.js';

import GraphCard from "./GraphCard.jsx";
import ReviewCount from "./ReviewCount.jsx";
import ListCard from './ListCard.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner.jsx';
import NoneFoundAlert from '../../../components/NoneFoundAlert.jsx';

const ObjectPanel = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);

  useEffect(() => {
    const { isLoading, errors, noneFound } = imagesStatsLoading;
    const noErrors = !errors || errors.length === 0;
    if (stats === null && !noneFound && !isLoading && noErrors) {
      dispatch(fetchStats(filters));
    }
  }, [stats, imagesStatsLoading, filters, dispatch]);

  useEffect(() => {
    const getStatsPending = imagesStatsLoading.isLoading && imagesStatsLoading.taskId;
    if (getStatsPending) {
      dispatch(fetchTask(imagesStatsLoading.taskId));
    }
  }, [imagesStatsLoading, dispatch]);

  if (imagesStatsLoading.isLoading) {
    return (
      <SpinnerOverlay>
        <SimpleSpinner />
      </SpinnerOverlay>
    );
  }

  if (imagesStatsLoading.noneFound) {
    return (
      <NoneFoundAlert>
        We couldn&apos;t find any images that matched this set of filters.
      </NoneFoundAlert>
    );
  }

  if (stats) {
    return (
      <>
        <ReviewCount
          label="Objects"
          count={stats.objectCount}
          reviewedCount={stats.objectReviewCount.reviewed}
          notReviewedCount={stats.objectReviewCount.notReviewed}
          reviewedHint='The total number of Objects that have been “reviewed”, i.e., Objects that are locked and a user has either validated one of the ML-predicted labels or manually added their own.'
          notReviewedHint='The total number of Objects that have not been “reviewed”, i.e., Objects that are unlocked and have ML-predicted labels that have not yet been validated or invalidated by a user'
          countHint='The total number of individual Objects found in the currently filtered Images.'
        />
        {Object.keys(stats['objectLabelList']).length !== 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <GraphCard
              label='Object-level detections'
              list={stats.objectLabelList}
              content='For each Label, the total number of Objects in the currently filtered set of Images for which that Label is their “Representative Label”. For example, if you have 2 images that each contain 3 pigs, their object-level detection count would be 6. Object-level annotations are the most granular annotations that Animl stores.'
              dataKey='Number Objects with a given “Representative Label”'
            />
          </div>
        )}
        {stats['objectReviewerList'].length !== 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <ListCard
              label='Reviewers'
              list={stats.objectReviewerList}
              content='Each reviewer&apo;s \"Reviewed Count\" is the total number of Objects they have edited in some way (e.g., validated/invalidated/added a Label)'
            />
          </div>
        )}
      </>
    );
  }

  return null;
}

export default ObjectPanel;
