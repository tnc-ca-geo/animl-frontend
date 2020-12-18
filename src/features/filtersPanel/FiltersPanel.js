import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  fetchCameras,
  fetchLabels,
  selectLabelFilter,
  selectCameraFilter,
 } from './filtersSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
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
  width: '370px',
  borderRight: '$1 solid $gray400'
});

const FiltersPanel = () => {
  const labelFilter = useSelector(selectLabelFilter);
  const cameraFilter = useSelector(selectCameraFilter);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!Object.keys(cameraFilter.cameras).length) {
      dispatch(fetchCameras());
    }
    if (!Object.keys(labelFilter.categories).length) {
      dispatch(fetchLabels());
    }
  }, [cameraFilter, labelFilter, dispatch]);

  return (
    <StyledFiltersPanel>
      <FiltersHeader>
        <Label>
          Filters
        </Label>
        <IconButton variant='ghost'>
          <FontAwesomeIcon icon={['fas', 'times']}/>
        </IconButton>
      </FiltersHeader>
      <Accordion
        label='Cameras'
        expandedDefault={true}
      >
        <CameraFilter cameras={cameraFilter.cameras} />
      </Accordion>
      <Accordion
        label='Labels'
        expandedDefault={true}
      >
        <LabelFilter categories={labelFilter.categories} />
      </Accordion>
      <Accordion
        label='Date Created'
        expandedDefault={false}
      >
        <DateFilter type='dateCreated'/>
      </Accordion>
      <Accordion
        label='Date Added'
        expandedDefault={false}
      >
        <DateFilter type='dateAdded'/>
      </Accordion>
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;