import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAvailLabels,
  selectActiveFilters,
  checkboxFilterToggled
} from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';


const LabelFilter = () => {
  const availLabels = useSelector(selectAvailLabels);
  const activeFilters = useSelector(selectActiveFilters);
  const activeLabels = activeFilters.labels;
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filterCat: 'labels',
      val: e.target.dataset.category,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  return (
    <Accordion
      label='Labels'
      selectedCount={activeLabels ? activeLabels.length : availLabels.ids.length}
      expandedDefault={false}
    >
      <BulkSelectCheckbox
        filterCat='labels'
        managedIds={availLabels.ids}
        showLabel={true}
      />
        {availLabels.ids.map((id) => {
          const checked = activeLabels === null || activeLabels.includes(id);
          return (
            <CheckboxWrapper key={id}>
              <label>
                <Checkbox
                  checked={checked}
                  active={checked}
                  data-category={id}
                  onChange={handleCheckboxChange}
                />
                <CheckboxLabel
                  checked={checked}
                  active={checked}
                >
                  {id}
                </CheckboxLabel>
              </label>
            </CheckboxWrapper>
          )
        })}
    </Accordion>
  );
};

export default LabelFilter;

