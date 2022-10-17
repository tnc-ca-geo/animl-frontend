import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
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
import { selectLabelsLoading, checkboxOnlyButtonClicked } from '../filters/filtersSlice';


const NoneFoundAlert = styled('div', {
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray600',
});


const LabelFilter = () => {
  const availLabels = useSelector(selectAvailLabels);
  const activeFilters = useSelector(selectActiveFilters);
  const activeLabels = activeFilters.labels;
  const labelsLoading = useSelector(selectLabelsLoading);
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
      {labelsLoading.noneFound && <NoneFoundAlert>no labels found</NoneFoundAlert>}
      {availLabels.ids.length > 0 &&
        <>
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
                    <LabelCheckboxLabel
                      checked={checked}
                      active={checked}
                      filterCat='labels'
                      id={id}
                    />
                  </label>
                </CheckboxWrapper>
              )
            })}
        </>
      }
    </Accordion>
  );
};

const OnlyButton = styled('div', {
  // position: 'absolute',
  // right: '16px',
  background: '$gray200',
  padding: '$0 $2',
  fontWeight: '$5',
  '&:hover': {
    textDecoration: 'underline',
  }
});

// NOTE: this could be abstracted into it's own component 
// essentially same code is used in CameraFilterSection.js
// the styling, however, is slightly different 

const LabelCheckboxLabel = ({
  id,
  checked,
  active,
  filterCat,
}) => {
  const [ showOnlyButton, setShowOnlyButton ] = useState(false);
  const dispatch = useDispatch();

  const handleOnlyButtonClick = (e) => {
    e.preventDefault();
    dispatch(checkboxOnlyButtonClicked({ filterCat, managedIds: [id] }));
  };

  return (
    <CheckboxLabel
      checked={checked}
      active={active}
      onMouseEnter={() => setShowOnlyButton(true)}
      onMouseLeave={() => setShowOnlyButton(false)}
    >
      {id}
      {showOnlyButton &&
        <OnlyButton onClick={handleOnlyButtonClick}>only</OnlyButton>
      }
    </CheckboxLabel>
  )
};

export default LabelFilter;

