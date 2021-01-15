import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { checkboxFilterToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';

const CheckboxLabel = styled.span({
  marginLeft: '$2',
  fontFamily: '$mono',
  fontSize: '$3',
  ':hover': {
    cursor: 'pointer',
  },
});

const CheckboxWrapper = styled.div({
  marginBottom: '$1',
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
      {availLabels.categories.map((cat) => (
          <CheckboxWrapper key={cat}>
            <label>
              <Checkbox
                checked={activeLabels === null || activeLabels.includes(cat)}
                data-category={cat}
                onChange={handleCheckboxChange}
              />
              <CheckboxLabel>{cat}</CheckboxLabel>
            </label>
          </CheckboxWrapper>
        )
      )}
    </div>
  );
};

export default LabelFilter;

