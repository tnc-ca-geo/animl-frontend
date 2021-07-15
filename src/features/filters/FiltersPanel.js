import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { fetchCameras } from '../cameras/camerasSlice';
import {
  fetchLabels,
  selectActiveFilters,
  selectAvailCameras,
  selectAvailLabels,
 } from './filtersSlice';
import PanelHeader from '../../components/PanelHeader';
import Accordion from '../../components/Accordion';
import CameraFilter from './CameraFilter';
import ReviewFilter from './ReviewFilter';
import DateFilter from './DateFilter';
import LabelFilter from './LabelFilter';

// const Label = styled.span({
//   // marginLeft: '$2',
// });

const StyledFiltersPanel = styled.div({
  position: 'relative',
  borderRight: '$1 solid $gray400',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '300px', 
});

const FiltersPanel = ({ toggleFiltersPanel }) => {
  const activeFilters = useSelector(selectActiveFilters);
  const availCameras = useSelector(selectAvailCameras);
  const availLabels = useSelector(selectAvailLabels);
  const dispatch = useDispatch();

  useEffect(() => {
    // if (!availCameras.ids.length &&
    //     !availCameras.noneFound && 
    //     !availCameras.error) {
    //   dispatch(fetchCameras());
    // }
    if (!availLabels.categories.length && 
        !availLabels.noneFound && 
        !availLabels.error) {
      dispatch(fetchLabels());
    }
  }, [availCameras, availLabels, dispatch]);

  return (
    <StyledFiltersPanel>
      <PanelHeader 
        title='Filters'
        handlePanelClose={toggleFiltersPanel}
      >
      </PanelHeader>
      <Accordion
        label='Cameras'
        expandedDefault={true}
      >
        <CameraFilter
          availCams={availCameras}
          activeCams={activeFilters.cameras}
        />
      </Accordion>
      <Accordion
        label='Labels'
        expandedDefault={true}
      >
        <LabelFilter
          availLabels={availLabels}
          activeLabels={activeFilters.labels}
        />
      </Accordion>
      <Accordion
        label='Review'
        expandedDefault={true}
      >
        <ReviewFilter/>
      </Accordion>
      <Accordion
        label='Date Created'
        expandedDefault={false}
      >
        <DateFilter type='created'/>
      </Accordion>
      <Accordion
        label='Date Added'
        expandedDefault={false}
      >
        <DateFilter type='added'/>
      </Accordion>
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;