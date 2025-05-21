import React from 'react';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';

export const SortCheckbox = ({ label, isCurrentSort, handleSortChanged }) => {
  return (
    <CheckboxWrapper>
      <label>
        <Checkbox checked={isCurrentSort} active={true} onChange={() => handleSortChanged()} />
        <CheckboxLabel checked={isCurrentSort} active={true} onChange={() => handleSortChanged()}>
          {label}
        </CheckboxLabel>
      </label>
    </CheckboxWrapper>
  );
};
