import React from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { reviewedFilterToggled, selectReviewed } from './filtersSlice';
import Accordion from '../../components/Accordion';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';


const ReviewFilter = () => {
  const dispatch = useDispatch();
  let reviewed = useSelector(selectReviewed);

  /*
    Reviewed can have 3 states: null, true, false. 
      1. Null: both reviewed and not reviewed images are included.
      2. True: Only reviewed images are included.
      3. False: only not-reviewed images are included.
    Using these 3 states we can then manage both the filter state and the UI state.
  */
  const handleCheckboxChange = (e) => {
    const objFilter = e.target.dataset.objFilter;
    if (objFilter === 'reviewed') 
      reviewed = reviewed === null ? false : reviewed === true ? false : null;
    else 
      reviewed = reviewed === null ? true : reviewed === true ? null : true;

    dispatch(reviewedFilterToggled({ reviewed }));
  };

  return (
    <Accordion label='Review' expandedDefault={false}>
      <CheckboxWrapper>
        <label>
          <Checkbox
            checked={reviewed ?? true}
            active={reviewed ?? true}
            data-obj-filter={'reviewed'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel
            checked={reviewed ?? true}
            active={reviewed ?? true}
          >
            reviewed images
          </CheckboxLabel>
        </label>
      </CheckboxWrapper>
      <CheckboxWrapper>
      <label>
        <Checkbox
          checked={!reviewed ?? true}
          active={!reviewed ?? true}
          data-obj-filter={'notReviewed'}
          onChange={handleCheckboxChange}
        />
        <CheckboxLabel
          checked={!reviewed ?? true }
          active={!reviewed ?? true}
        >
          not-reviewed images
        </CheckboxLabel>
      </label>
    </CheckboxWrapper>
    </Accordion>
  );
};

export default ReviewFilter;
