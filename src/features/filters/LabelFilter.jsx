import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectAvailLabels,
  selectActiveFilters,
  checkboxFilterToggled
} from './filtersSlice.js';
import Accordion from '../../components/Accordion.jsx';
import BulkSelectCheckbox from './BulkSelectCheckbox.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import NoneFoundAlert from '../../components/NoneFoundAlert.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import { selectLabelsLoading, checkboxOnlyButtonClicked } from './filtersSlice.js';

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
            isHeader={true}
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
  background: '$gray3',
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

