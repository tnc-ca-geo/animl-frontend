import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { checkboxFilterToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';

const CheckboxWrapper = styled('div', {
  marginBottom: '$2',
});

const LabelFilter = ({ availLabels, activeLabels }) => {
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filter: 'labels',
      key: 'categories',
      val: e.target.dataset.category,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  return (
    <div>
      {availLabels.categories.map((cat) => {
        const checked = activeLabels === null || activeLabels.includes(cat);
        return (
          <CheckboxWrapper key={cat}>
            <label>
              <Checkbox
                checked={checked}
                data-category={cat}
                onChange={handleCheckboxChange}
              />
              <CheckboxLabel checked={checked}>{cat}</CheckboxLabel>
            </label>
          </CheckboxWrapper>
        )
      })}
    </div>
  );
};

export default LabelFilter;

