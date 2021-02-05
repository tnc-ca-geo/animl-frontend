import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectSelectedView,
} from '../filters/filtersSlice';
import {
  fetchCameras,
  fetchLabels,
  viewSelected,
  selectFiltersReady,
  selectActiveFilters,
  selectAvailCameras,
  selectAvailLabels,
 } from './filtersSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
import PanelHeader from '../../components/PanelHeader';
import Accordion from '../../components/Accordion';
import CameraFilter from './CameraFilter';
import DateFilter from './DateFilter';
import LabelFilter from './LabelFilter';


const Label = styled.span({
  // marginLeft: '$2',
});

const FiltersHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $2 $0 $3',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  fontWeight: '$5',
});

const StyledFiltersPanel = styled.div({
  position: 'relative',
  // width: '370px',
  borderRight: '$1 solid $gray400',
  transition: 'width 1s ease-out',
  variants: {
    expanded: {
      true: {
        width: '370px',
      },
      false: {
        width: '0px',
      },
    },
  }
});

const FiltersPanel = ({ expandedDefault }) => {
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const availCameras = useSelector(selectAvailCameras);
  const availLabels = useSelector(selectAvailLabels);
  const [ expanded, setExpanded ] = useState(expandedDefault);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!availCameras.ids.length) {
      dispatch(fetchCameras());
    }
    if (!availLabels.categories.length) {
      dispatch(fetchLabels());
    }
  }, [availCameras, availLabels, dispatch]);

  const handleFilterPanelClose = () => {
    setExpanded(false);
  }

  return (
    <StyledFiltersPanel expanded={expanded}>
      <PanelHeader 
        title='Filters'
        handlePanelClose={handleFilterPanelClose}
      />
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