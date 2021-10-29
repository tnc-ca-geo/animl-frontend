import React, { useState, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { selectActiveFilters, bulkSelectToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';

const StyledBulkSelectCheckbox = styled('div', {
  backgroundColor: '$loContrast',
  fontWeight: '$5',
  fontFamily: '$sourceSansPro',
  'label': {
    display: 'flex',
  },
  textTransform: 'uppercase',
  borderBottom: '1px solid $gray400',
});

const BulkSelectCheckbox = ({ filterCat, filterIds, showLabel }) => {
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
    const allSelected = (idsToCheck, activeIds) => (
      (activeIds && idsToCheck.every((id) => activeIds.includes(id))) ||
      activeIds === null
    );
    const noneSelected = (idsToCheck, activeIds) => (
      activeIds && idsToCheck.every((id) => !activeIds.includes(id))
    );

    if (allSelected(filterIds, activeFilters[filterCat])) {
      setCheckboxState('allSelected');
    }
    else if (noneSelected(filterIds, activeFilters[filterCat])) {
      setCheckboxState('noneSelected');
    }
    else {
      setCheckboxState('someSelected');
    }
  }, [ activeFilters, filterCat, filterIds ]);

  const handleCheckboxChange = (e) => {
    dispatch(bulkSelectToggled({
      currState: checkboxState,
      filterCat,
      filterIds,
    }));
  };

  return (
    <StyledBulkSelectCheckbox>
      <label>
        <Checkbox
          checked={stateMap[checkboxState].checked}
          active={stateMap[checkboxState].active}
          indeterminate={stateMap[checkboxState].indeterminate}
          onChange={handleCheckboxChange}
        />
        {showLabel &&
          <CheckboxLabel
            checked={stateMap[checkboxState].checked}
            active={stateMap[checkboxState].active}
            css={{fontFamily: '$sourceSansPro'}}
          >
            {stateMap[checkboxState].label}
          </CheckboxLabel>
        }
      </label>
    </StyledBulkSelectCheckbox>
  );
};

export default BulkSelectCheckbox;

