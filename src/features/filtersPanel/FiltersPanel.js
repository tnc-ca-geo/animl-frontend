import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Accordion from '../../components/Accordion';
import CameraFilter from './CameraFilter';
import DateFilter from './DateFilter';

const Label = styled.span({
  marginLeft: '$2',
});

const FiltersHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  padding: '$0 $3',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  fontWeight: '$5',
});

const StyledFiltersPanel = styled.div({
  width: '370px',
  borderRight: '$1 solid $gray400'
});

const FiltersPanel = () => {
  return (
    <StyledFiltersPanel>
      <FiltersHeader>
        <FontAwesomeIcon icon={['fas', 'filter']} />
        <Label>
          Filters
        </Label>
      </FiltersHeader>
      <Accordion
        label='Cameras'
        expandedDefault={true}
      >
        <CameraFilter />
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