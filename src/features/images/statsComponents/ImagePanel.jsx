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

const ImagePanel = ({ open }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectActiveFilters);

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);

  useEffect(() => {
    const { isLoading, errors, noneFound } = imagesStatsLoading;
    const noErrors = !errors || errors.length === 0;
    if (open && stats === null && !noneFound && !isLoading && noErrors) {
      dispatch(fetchStats(filters));
    }
  }, [open, stats, imagesStatsLoading, filters, dispatch]);

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
          label="Images"
          count={stats.imageCount}
          reviewedCount={stats.imageReviewCount.reviewed}
          notReviewedCount={stats.imageReviewCount.notReviewed}
          reviewedHint='The total number of Images that have been “reviewed”. Images are considered reviewed once a user has validated at least one Label in all of the Image’s Objects (or overridden the predictions with their own Labels), and all the Image’s Objects are locked.'
          notReviewedHint='The total number of Images that either have unlocked Objects that still require review or have no Objects and have not been marked empty.'
          countHint='The total number of Images that match the current filters.'
        />
        {Object.keys(stats['imageLabelList']).length !== 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <GraphCard
              label='Image-level detections'
              list={stats.imageLabelList}
              content='For each Label, the total number of Images matching the current filters that have at least one Object for which that Label is their “Representative Label”. For example, if you have 2 images that each contain 3 pigs, their image-level detection count would be 2.'
              dataKey='Number Images that contain at least one Object with a given “Representative Label”'
            />
          </div>
        )}
        {stats['objectReviewerList'].length !== 0 && (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <ListCard
              label='Reviewers'
              list={stats.imageReviewerList}
              content='Each reviewer&apos;s "Reviewed Count" is the total number of images they have edited in some way (validated/invalidated a label, added objects, etc.)'
            />
          </div>
        )}
      </>
    );
  }

  return null;
}

export default ImagePanel;
