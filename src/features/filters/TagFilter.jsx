import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAvailTagFilters,
  selectActiveFilters,
  checkboxFilterToggled,
} from './filtersSlice.js';
import Accordion from '../../components/Accordion.jsx';
import BulkSelectCheckbox from './BulkSelectCheckbox.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import NoneFoundAlert from '../../components/NoneFoundAlert.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import { LabelCheckboxLabel } from './LabelCheckboxLabel.jsx';

const TagFIlter = () => {
  const availTags = useSelector(selectAvailTagFilters);
  const activeFilters = useSelector(selectActiveFilters);
  const activeTags = activeFilters.tags;
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filterCat: 'tags',
      val: e.target.dataset.category,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  const managedIds = useMemo(() => availTags.options.map(({ _id }) => _id), [availTags.options]);
  const sortedTags = [...availTags.options].sort((tagA, tagB) =>
    tagA.name.toLowerCase() > tagB.name.toLowerCase() ? 1 : -1,
  );

  return (
    <Accordion
      label="Tags"
      selectedCount={activeTags ? activeTags.length : availTags.options.length}
      expandedDefault={false}
      expandOnHeaderClick={true}
    >
      {availTags.options.length === 0 && <NoneFoundAlert>no tags found</NoneFoundAlert>}
      {availTags.options.length > 0 && (
        <>
          <BulkSelectCheckbox filterCat="tags" managedIds={managedIds} isHeader={true} />
          {sortedTags.map(({ _id, name }) => {
            const checked = activeTags === null || activeTags.includes(_id);
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
                    filterCat="tags"
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

export default TagFIlter;
