import React, { useState, useMemo } from 'react';
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
import { checkboxOnlyButtonClicked } from './filtersSlice.js';

const LabelFilter = () => {
  const availLabels = useSelector(selectAvailLabels);
  const activeFilters = useSelector(selectActiveFilters);
  const activeLabels = activeFilters.labels;
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filterCat: 'labels',
      val: e.target.dataset.category,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  const managedIds = useMemo(() => availLabels.options.map(({ _id }) => _id), [availLabels.options]);
  const sortedLabels = [...availLabels.options].sort((labelA, labelB) => labelA.name.toLowerCase() > labelB.name.toLowerCase() ? 1 : -1);

  return (
    <Accordion
      label='Labels'
      selectedCount={activeLabels ? activeLabels.length : availLabels.options.length}
      expandedDefault={false}
    > 
      {availLabels.options.length === 0 && <NoneFoundAlert>no labels found</NoneFoundAlert>}
      {availLabels.options.length > 0 &&
        <>
          <BulkSelectCheckbox
            filterCat='labels'
            managedIds={managedIds}
            isHeader={true}
          />
            {sortedLabels.map(({ _id, name }) => {
              const checked = activeLabels === null || activeLabels.includes(_id);
              return (
                <CheckboxWrapper key={_id}>
                  <label>
                    <Checkbox
                      checked={checked}
                      active={checked}
                      data-category={_id}
                      onChange={handleCheckboxChange}
                    />
                    <LabelCheckboxLabel
                      checked={checked}
                      active={checked}
                      filterCat='labels'
                      id={_id}
                      name={name}
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
  name,
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
      {name}
      {showOnlyButton &&
        <OnlyButton onClick={handleOnlyButtonClick}>only</OnlyButton>
      }
    </CheckboxLabel>
  )
};

export default LabelFilter;

