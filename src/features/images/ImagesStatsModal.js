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

const StatsDisplay = styled('div', {
  border: '1px solid $gray400',
  maxHeight: '50vh',
  overflowY: 'scroll',
});

const StyledStatsDisclaimer = styled('div', {
  paddingTop: 10,
  fontSize: '$3',
  color: '$gray600',
});

const StatsDisclaimer = () => (
  <StyledStatsDisclaimer>
    NOTE: this is a WIP. Be mindful of the following:
    <ul>
      <li>
        each reviewer's "reviewedCount" is the total number 
        of <em>images</em> they have edited in some way (validated/invalidated 
        a label, added objects, etc.). Because multiple users can edit the same 
        image, and because images that have been edited can still be 
        considered "not reviewed" (e.g., if a user invalidated all labels on 
        all objects, but did't mark it empty), the sum of all reviewers 
        "reviewedCounts" very likely will not equal the "reviewedCount" 
        "reviewed" quantity
      </li>
      <li>
        the quantities in the "labelList" are for locked objects 
        with <em>validated</em> labels only, so they do not include ML 
        predicted labels that need review
      </li>
    </ul>
  </StyledStatsDisclaimer>
)

const ImagesStatsModal = ({ filters }) => {
  const dispatch = useDispatch();

  // fetch images stats
  const stats = useSelector(selectImagesStats);
  const imagesStatsLoading = useSelector(selectStatsLoading);
  useEffect(() => {
    const { isLoading, errors, noneFound } = imagesStatsLoading;
    if (stats === null && !noneFound && !isLoading && !errors.length){
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
      {stats && 
        <>
          <StatsDisplay>
            <pre>{JSON.stringify(stats, null, 2)}</pre>
          </StatsDisplay>
          <StatsDisclaimer />
        </>
      }
    </div>
  );
};

export default ImagesStatsModal;

