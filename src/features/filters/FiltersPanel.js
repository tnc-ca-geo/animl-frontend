import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectActiveFilters,
  selectAvailCameras,
  selectAvailLabels,
 } from './filtersSlice';
 import { selectRouterLocation } from '../images/imagesSlice';
import PanelHeader from '../../components/PanelHeader';
import DeploymentFilter from './DeploymentFilter';
import ReviewFilter from './ReviewFilter';
import DateFilter from './DateFilter';
import LabelFilter from './LabelFilter';
import CustomFilter from './CustomFilter.js';
import FiltersPanelFooter from './FiltersPanelFooter';
import { selectSelectedProject } from '../projects/projectsSlice.js';

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
  const router = useSelector(selectRouterLocation);

  const [ showCustomFilter, setShowCustomFilter ] = useState(false);
  useEffect(() => {
    const showFilt = ('cf' in router.query) && (router.query['cf'] === 'true');
    setShowCustomFilter(showFilt);
  }, [ router ]);

  return (
    <StyledFiltersPanel>
      <PanelHeader 
        title='Filters'
        handlePanelClose={toggleFiltersPanel}
      >
      </PanelHeader>
      <PanelBody>
        <DeploymentFilter/>
        <LabelFilter/>
        <ReviewFilter/>
        <DateFilter type='created'/>
        <DateFilter type='added'/>
        {showCustomFilter &&
          <CustomFilter />
        }
      </PanelBody>
      <FiltersPanelFooter />
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;