import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { reviewFilterToggled, selectReviewed } from './filtersSlice';
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

const ReviewFilter = () => {
  const dispatch = useDispatch();
  const reviewed = useSelector(selectReviewed);

  const handleCheckboxChange = (e) => {
    const objFilter = e.target.dataset.objFilter;
    dispatch(reviewFilterToggled({type: objFilter}));
  };

  return (
    <>
      <CheckboxWrapper>
        <label>
          <Checkbox
            checked={reviewed}
            data-obj-filter={'reviewed'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel>reviewed images</CheckboxLabel>
        </label>
      </CheckboxWrapper>
    </>
  );
};

export default ReviewFilter;
