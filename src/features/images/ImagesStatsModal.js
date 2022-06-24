import React, { useEffect, useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectStatsLoading,
  selectImagesStats,
  fetchStats
} from './imagesSlice';




const ImagesStatsModal = ({ imgsCount, filters }) => {
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
      Images stats
    </div>
  );
};

export default ImagesStatsModal;

