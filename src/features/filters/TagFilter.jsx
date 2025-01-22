import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectAvailTagFilters,
  selectActiveFilters,
  checkboxFilterToggled,
  checkboxOnlyButtonClicked,
} from './filtersSlice.js';
import Accordion from '../../components/Accordion.jsx';
import BulkSelectCheckbox from './BulkSelectCheckbox.jsx';
import Checkbox from '../../components/Checkbox.jsx';
import NoneFoundAlert from '../../components/NoneFoundAlert.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';

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

const OnlyButton = styled('div', {
  // position: 'absolute',
  // right: '16px',
  background: '$gray3',
  padding: '$0 $2',
  fontWeight: '$5',
  '&:hover': {
    textDecoration: 'underline',
  },
});

// NOTE: this could be abstracted into it's own component
// essentially same code is used in CameraFilterSection.js
// the styling, however, is slightly different

const LabelCheckboxLabel = ({ id, name, checked, active, filterCat }) => {
  const [showOnlyButton, setShowOnlyButton] = useState(false);
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
      {showOnlyButton && <OnlyButton onClick={handleOnlyButtonClick}>only</OnlyButton>}
    </CheckboxLabel>
  );
};

export default TagFIlter;
