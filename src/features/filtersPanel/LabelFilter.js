import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { labelToggled } from './filtersSlice';
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

const LabelFilter = ({ categories }) => {
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const category = e.target.dataset.category;
    dispatch(labelToggled(category));
  };

  return (
    <div>
      {Object.keys(categories).map((category) => {
        return (
          <CheckboxWrapper key={category}>
            <label>
              <Checkbox
                checked={categories[category].selected}
                data-category={category}
                onChange={handleCheckboxChange}
              />
              <CheckboxLabel>{category}</CheckboxLabel>
            </label>
          </CheckboxWrapper>
        )
      })}
    </div>
  );
};

export default LabelFilter;

