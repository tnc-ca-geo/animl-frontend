import React, { useEffect, useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  selectStatsLoading,
  selectImagesStats,
  fetchStats
} from './imagesSlice';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';

const NoneFoundAlert = styled('div', {
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray600',
});

const ImagesStatsModal = ({ filters }) => {
  const dispatch = useDispatch();

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);
  useEffect(() => {
    const { isLoading, errors, noneFound } = imagesStatsLoading;
    if (stats === null && !noneFound && !isLoading && !errors){
      dispatch(fetchStats(filters));
    }
  }, [stats, imagesStatsLoading, filters, dispatch]);

  return (
    <div>
      {imagesStatsLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      {imagesStatsLoading.noneFound &&
        <NoneFoundAlert>
          We couldn't find any images that matched this set of filters.
        </NoneFoundAlert>
      }
      {stats && <pre>{JSON.stringify(stats, null, 2)}</pre>}
    </div>
  );
};

export default ImagesStatsModal;

