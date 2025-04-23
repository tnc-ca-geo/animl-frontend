import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { checkboxOnlyButtonClicked } from './filtersSlice';
import { selectGlobalBreakpoint } from '../projects/projectsSlice';

const OnlyButton = styled('div', {
  background: '$gray3',
  padding: '$0 $2',
  fontWeight: '$5',
  '&:hover': {
    textDecoration: 'underline',
  },
  display: 'none',
  variants: {
    hover: {
      true: {
        display: 'unset',
      },
    },
  },
  marginLeft: 'auto',
  '@bp1': {
    marginLeft: 'unset',
  },
});

export const LabelCheckboxLabel = ({ id, name, checked, active, filterCat }) => {
  const [showOnlyButton, setShowOnlyButton] = useState(false);
  const dispatch = useDispatch();

  const handleOnlyButtonClick = (e) => {
    e.preventDefault();
    dispatch(checkboxOnlyButtonClicked({ filterCat, managedIds: [id] }));
  };

  const globalBreakpoint = useSelector(selectGlobalBreakpoint);
  const alwaysShowOnly = globalBreakpoint === 'xs' || globalBreakpoint === 'xxs';

  return (
    <CheckboxLabel
      checked={checked}
      active={active}
      onMouseEnter={() => setShowOnlyButton(true)}
      onMouseLeave={() => setShowOnlyButton(false)}
    >
      {name}
      <OnlyButton onClick={handleOnlyButtonClick} hover={alwaysShowOnly || showOnlyButton}>
        only
      </OnlyButton>
    </CheckboxLabel>
  );
};
