import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { selectStatsLoading, selectImagesStats } from './imagesSlice';
import { fetchStats, fetchTask } from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import NoneFoundAlert from '../../components/NoneFoundAlert';

const StatsDisplay = styled('div', {
  border: '1px solid $border',
  maxHeight: '50vh',
  overflowY: 'scroll',
});

const StyledStatsDisclaimer = styled('div', {
  paddingTop: 10,
  fontSize: '$3',
  color: '$textMedium',
});

const StatsDisclaimer = () => (
  <StyledStatsDisclaimer>
    NOTE: this is a WIP. Be mindful of the following:
    <ul>
      <li>
        each reviewer&apos;s &quot;reviewedCount&quot; is the total number of <em>images</em> they have edited in some
        way (validated/invalidated a label, added objects, etc.). Because multiple users can edit the same image, and
        because images that have been edited can still be considered &quot;not reviewed&quot; (e.g., if a user
        invalidated all labels on all objects, but did&apos;t mark it empty), the sum of all reviewers
        &quot;reviewedCounts&quot; very likely will not equal the &quot;reviewedCount&quot; &quot;reviewed&quot;
        quantity
      </li>
      <li>
        the quantities in the &quot;labelList&quot; are for locked objects with <em>validated</em> labels only, so they
        do not include ML predicted labels that need review
      </li>
    </ul>
  </StyledStatsDisclaimer>
);

const ImagesStatsModal = ({ open }) => {
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

  // const getStatsPending = imagesStatsLoading.isLoading && stats && stats.taskId;
  // useEffect(() => {
  //   if (getStatsPending) {
  //     dispatch(fetchTask(stats.taskId));
  //   }
  // }, [getStatsPending, stats, dispatch]);

  return (
    <div>
      {imagesStatsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {imagesStatsLoading.noneFound && (
        <NoneFoundAlert>We couldn&apos;t find any images that matched this set of filters.</NoneFoundAlert>
      )}
      {stats && (
        <>
          <StatsDisplay>
            <pre>{JSON.stringify(stats, null, 2)}</pre>
          </StatsDisplay>
          <StatsDisclaimer />
        </>
      )}
    </div>
  );
};

export default ImagesStatsModal;
