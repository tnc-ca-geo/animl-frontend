import React from 'react';
import { useState } from 'react';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import { styled } from '../../theme/stitches.config';
import IconButton from '../../components/IconButton';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

const SortSectionHeader = styled('div', {
  fontSize: '$2',
  display: 'flex',
  justifyContent: 'space-between',
});

const SortSection = styled('div', {
  marginLeft: 'calc($3 + 6px)',
  borderLeft: '1px solid $border',
  display: 'flex',
  flexDirection: 'column',
  padding: '0 $3 !important',
});

const ExpandButton = styled(IconButton, {
  height: '$3',
  width: '$3',
});

export const SortCheckboxes = ({ handleSortChanged, isDesc, headerLabel, descLabel, ascLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <SortSectionHeader>
        {headerLabel}
        <ExpandButton variant="ghost" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon size={16} />}
        </ExpandButton>
      </SortSectionHeader>
      {isExpanded && (
        <SortSection>
          <CheckboxWrapper>
            <label>
              <Checkbox checked={isDesc} active={isDesc} onChange={() => handleSortChanged(true)} />
              <CheckboxLabel
                checked={isDesc}
                active={true}
                onChange={() => handleSortChanged(true)}
              >
                {descLabel}
              </CheckboxLabel>
            </label>
          </CheckboxWrapper>
          <CheckboxWrapper>
            <label>
              <Checkbox
                checked={!isDesc}
                active={!isDesc}
                onChange={() => handleSortChanged(false)}
              />
              <CheckboxLabel
                checked={!isDesc}
                active={true}
                onChange={() => handleSortChanged(false)}
              >
                {ascLabel}
              </CheckboxLabel>
            </label>
          </CheckboxWrapper>
        </SortSection>
      )}
    </>
  );
};
