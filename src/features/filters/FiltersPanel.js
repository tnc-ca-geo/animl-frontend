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
import DeploymentFilter from './DeploymentFilter';
import ReviewFilter from './ReviewFilter';
import DateFilter from './DateFilter';
import LabelFilter from './LabelFilter';
import FiltersPanelFooter from './FiltersPanelFooter';


// const Label = styled('span', {
//   // marginLeft: '$2',
// });

const PanelBody = styled('div', {
  height: 'calc(100% - $7 - $7)', // 2x $7's to account for header + footer
  overflowY: 'scroll',
  position: 'absolute',
  width: '100%',
});

const StyledFiltersPanel = styled('div', {
  position: 'relative',
  borderRight: '1px solid $gray400',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '330px',
  height: 'calc(100vh - $8)',
  overflowY: 'hidden',
});

const FiltersPanel = ({ toggleFiltersPanel }) => {
  const activeFilters = useSelector(selectActiveFilters);
  const availCameras = useSelector(selectAvailCameras);
  const availLabels = useSelector(selectAvailLabels);
  const dispatch = useDispatch();

  useEffect(() => {
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
      <PanelBody>
        <DeploymentFilter
          availCams={availCameras}
          activeCams={activeFilters.cameras}
        />
        <LabelFilter
          availLabels={availLabels}
          activeLabels={activeFilters.labels}
        />
        <ReviewFilter/>
        <DateFilter type='created'/>
        <DateFilter type='added'/>
      </PanelBody>
      <FiltersPanelFooter />
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;