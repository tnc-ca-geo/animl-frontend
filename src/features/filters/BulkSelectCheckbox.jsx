import React, { useState, useEffect } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveFilters, bulkSelectToggled } from './filtersSlice.js';
import Checkbox from '../../components/Checkbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';

const StyledBulkSelectCheckbox = styled('div', {
  backgroundColor: '$loContrast',
  fontWeight: '$5',
  fontFamily: '$sourceSansPro',
  label: {
    display: 'flex',
  },
  variants: {
    isHeader: {
      true: {
        textTransform: 'uppercase',
        borderBottom: '1px solid $border',
      },
    },
  },
});

const BulkSelectCheckbox = ({ filterCat, managedIds, isHeader }) => {
  const activeFilters = useSelector(selectActiveFilters);
  const [checkboxState, setCheckboxState] = useState('allSelected');
  const dispatch = useDispatch();

  const stateMap = {
    notAllSelected: {
      checked: false,
      active: false,
      indeterminate: false,
      label: 'select all',
    },
    allSelected: {
      checked: true,
      active: true,
      indeterminate: false,
      label: 'unselect all',
    },
  };

  useEffect(() => {
    const allSelected = (idsToCheck, activeIds) =>
      (activeIds && idsToCheck.every((id) => activeIds.includes(id))) || activeIds === null;

    if (allSelected(managedIds, activeFilters[filterCat])) {
      setCheckboxState('allSelected');
    } else {
      setCheckboxState('notAllSelected');
    }
  }, [activeFilters, filterCat, managedIds]);

  const handleCheckboxChange = () => {
    dispatch(
      bulkSelectToggled({
        currState: checkboxState,
        managedIds,
        filterCat,
      }),
    );
  };

  return (
    <StyledBulkSelectCheckbox isHeader={isHeader}>
      <label>
        <Checkbox
          checked={stateMap[checkboxState].checked}
          active={stateMap[checkboxState].active}
          indeterminate={stateMap[checkboxState].indeterminate}
          onChange={handleCheckboxChange}
        />
        {isHeader && (
          <CheckboxLabel
            checked={stateMap[checkboxState].checked}
            active={stateMap[checkboxState].active}
            css={{ fontFamily: '$sourceSansPro' }}
          >
            {stateMap[checkboxState].label}
          </CheckboxLabel>
        )}
      </label>
    </StyledBulkSelectCheckbox>
  );
};

export default BulkSelectCheckbox;
