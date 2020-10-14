import React from 'react';
import styled from 'styled-components';
import Accordion from '../../components/Accordion';
import CameraFilter from './CameraFilter';
import DateCreatedFilter from './DateCreatedFilter';

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 20px;
  height: 50px;
  border-bottom: ${props => props.theme.border};
  font-weight: 700;
`;

const StyledFiltersPanel = styled.div`
  width: 350px;
  border-right: ${props => props.theme.border};
`;

const FiltersPanel = () => {
  return (
    <StyledFiltersPanel>
      <FiltersHeader>
        Filters
      </FiltersHeader>
      <Accordion
        label='Cameras'
        expandedDefault={true}
      >
        <CameraFilter />
      </Accordion>
      <Accordion
        label='Date Created'
        expandedDefault={true}
      >
        <DateCreatedFilter />
      </Accordion>
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;