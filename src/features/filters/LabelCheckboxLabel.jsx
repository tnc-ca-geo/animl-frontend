import React, { useState } from 'react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { tableBreakpoints } from '../images/config';
import { checkboxOnlyButtonClicked } from './filtersSlice';

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

  const { width } = useWindowSize();
  const bp1 = tableBreakpoints.find((bp) => bp[0] === 'xs')[1];

  return (
    <CheckboxLabel
      checked={checked}
      active={active}
      onMouseEnter={() => setShowOnlyButton(true)}
      onMouseLeave={() => setShowOnlyButton(false)}
    >
      {name}
      <OnlyButton onClick={handleOnlyButtonClick} hover={width <= bp1 || showOnlyButton}>
        only
      </OnlyButton>
    </CheckboxLabel>
  );
};
