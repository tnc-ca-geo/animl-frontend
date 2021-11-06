import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { checkboxFilterToggled } from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';

const LabelFilter = ({ availLabels, activeLabels }) => {
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filterCat: 'labels',
      key: 'categories',
      val: e.target.dataset.category,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  return (
    <Accordion
      label='Labels'
      selectedCount={activeLabels ? activeLabels.length : availLabels.categories.length}
      expandedDefault={false}
    >
      <BulkSelectCheckbox
        filterCat='labels'
        filterIds={availLabels.categories}
        showLabel={true}
      />
        {availLabels.categories.map((cat) => {
          const checked = activeLabels === null || activeLabels.includes(cat);
          return (
            <CheckboxWrapper key={cat}>
              <label>
                <Checkbox
                  checked={checked}
                  active={checked}
                  data-category={cat}
                  onChange={handleCheckboxChange}
                />
                <CheckboxLabel
                  checked={checked}
                  active={checked}
                >
                  {cat}
                </CheckboxLabel>
              </label>
            </CheckboxWrapper>
          )
        })}
    </Accordion>
  );
};

export default LabelFilter;

