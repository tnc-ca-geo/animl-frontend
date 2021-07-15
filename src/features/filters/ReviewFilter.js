import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { reviewFilterToggled, selectReviewed } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';

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
            checked={reviewed === null || reviewed}
            data-obj-filter={'reviewed'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel
            checked={reviewed === null || reviewed}
          >
            reviewed images
          </CheckboxLabel>
        </label>
      </CheckboxWrapper>
    </>
  );
};

export default ReviewFilter;
