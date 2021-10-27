import React, { useState, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveFilters, bulkSelectToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';

const StyledBulkSelect = styled('div', {
  backgroundColor: '$gray300',
  fontWeight: '$5',
});

const BulkSelect = ({ filterIds }) => {
  const activeFilters = useSelector(selectActiveFilters);
  const [ checkboxState, setCheckboxState ] = useState('someSelected');
  const dispatch = useDispatch();

  const stateMap = {
    noneSelected: {
      checked: false, 
      active: false,
      indeterminate: false,
      label: 'select all'
    },
    allSelected: {
      checked: true, 
      active: true,
      indeterminate: false,
      label: 'unselect all'
    },
    someSelected: {
      checked: false, 
      active: true,
      indeterminate: true,
      label: 'clear selection'
    }
  };

  useEffect(() => {
    const allFiltersSelected = (val) => val === null;
    const noFiltersSelected = (val) => val && val.length === 0;
    const controlledFilts = filterIds.map((filt) => activeFilters[filt]);
    if (controlledFilts.every(allFiltersSelected)) {
      setCheckboxState('allSelected');
    }
    else if (controlledFilts.every(noFiltersSelected)) {
      setCheckboxState('noneSelected');
    }
    else {
      setCheckboxState('someSelected');
    }
  }, [ filterIds, activeFilters ]);

  const handleCheckboxChange = (e) => {
    dispatch(bulkSelectToggled({
      filterIds,
      currState: checkboxState,
    }));
  };

  return (
    <StyledBulkSelect>
      <div>
        <label>
          <Checkbox
            checked={stateMap[checkboxState].checked}
            active={stateMap[checkboxState].active}
            indeterminate={stateMap[checkboxState].indeterminate}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel
            checked={stateMap[checkboxState].checked}
            active={stateMap[checkboxState].active}
          >
            {stateMap[checkboxState].label}
          </CheckboxLabel>
        </label>
      </div>

    </StyledBulkSelect>
  );
};

export default BulkSelect;

