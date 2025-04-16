import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAvailLabelFilters,
  selectActiveFilters,
  checkboxFilterToggled,
} from './filtersSlice.js';
import Accordion from '../../components/Accordion.jsx';
import BulkSelectCheckbox from './BulkSelectCheckbox.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import NoneFoundAlert from '../../components/NoneFoundAlert.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import { LabelCheckboxLabel } from './LabelCheckboxLabel.jsx';

const LabelFilter = () => {
  const availLabels = useSelector(selectAvailLabelFilters);
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

  const managedIds = useMemo(
    () => availLabels.options.map(({ _id }) => _id),
    [availLabels.options],
  );
  const sortedLabels = [...availLabels.options].sort((labelA, labelB) =>
    labelA.name.toLowerCase() > labelB.name.toLowerCase() ? 1 : -1,
  );

  return (
    <Accordion
      label="Labels"
      selectedCount={activeLabels ? activeLabels.length : availLabels.options.length}
      expandedDefault={false}
      expandOnHeaderClick={true}
    >
      {availLabels.options.length === 0 && <NoneFoundAlert>no labels found</NoneFoundAlert>}
      {availLabels.options.length > 0 && (
        <>
          <BulkSelectCheckbox filterCat="labels" managedIds={managedIds} isHeader={true} />
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
                    filterCat="labels"
                    id={_id}
                    name={name}
                  />
                </label>
              </CheckboxWrapper>
            );
          })}
        </>
      )}
    </Accordion>
  );
};

export default LabelFilter;
