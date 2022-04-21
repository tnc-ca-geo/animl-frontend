import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { reviewFilterToggled, selectReviewed } from './filtersSlice';
import Accordion from '../../components/Accordion';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';


const ReviewFilter = () => {
  const dispatch = useDispatch();
  const reviewed = useSelector(selectReviewed);
  const includeReviewed = reviewed === null || reviewed;

  const handleCheckboxChange = (e) => {
    const objFilter = e.target.dataset.objFilter;
    dispatch(reviewFilterToggled({type: objFilter}));
  };

  return (
    <Accordion label='Review' expandedDefault={false}>
      <CheckboxWrapper>
        <label>
          <Checkbox
            checked={includeReviewed}
            active={includeReviewed}
            data-obj-filter={'reviewed'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel
            checked={includeReviewed}
            active={includeReviewed}
          >
            reviewed images
          </CheckboxLabel>
        </label>
      </CheckboxWrapper>
    </Accordion>
  );
};

export default ReviewFilter;
