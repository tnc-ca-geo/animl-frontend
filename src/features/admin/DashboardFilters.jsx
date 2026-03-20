import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { selectAdminFilter, setFilter } from './adminSlice';

const PROJECT_TYPES = [
  { value: 'external', label: 'External' },
  { value: 'internal', label: 'Internal' },
];

const PROJECT_STAGES = [
  { value: 'production', label: 'Production' },
  { value: 'demo', label: 'Demo' },
];

const FilterBar = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$9',
  flexWrap: 'wrap',
  padding: '$2 $3',
  marginBottom: '$4',
  background: '$loContrast',
  border: '1px solid $border',
  borderRadius: '$2',
});

const FilterGroup = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const GroupLabel = styled('span', {
  fontSize: '$2',
  fontWeight: '$4',
  color: '$textDark',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginRight: '$1',
});

const CheckboxItem = styled('label', {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
});

const DashboardFilters = () => {
  const dispatch = useDispatch();
  const filter = useSelector(selectAdminFilter);

  const handleTypeToggle = useCallback(
    (typeValue) => {
      const currentTypes = filter.types || [];
      const newTypes = currentTypes.includes(typeValue)
        ? currentTypes.filter((t) => t !== typeValue)
        : [...currentTypes, typeValue];
      dispatch(setFilter({ ...filter, types: newTypes }));
    },
    [dispatch, filter],
  );

  const handleStageToggle = useCallback(
    (stageValue) => {
      const currentStages = filter.stages || [];
      const newStages = currentStages.includes(stageValue)
        ? currentStages.filter((s) => s !== stageValue)
        : [...currentStages, stageValue];
      dispatch(setFilter({ ...filter, stages: newStages }));
    },
    [dispatch, filter],
  );

  return (
    <FilterBar>
      <FilterGroup>
        <GroupLabel>Project Type:</GroupLabel>
        {PROJECT_TYPES.map((type) => {
          const checked = (filter.types || []).includes(type.value);
          return (
            <CheckboxItem key={type.value}>
              <Checkbox
                checked={checked}
                active={true}
                indeterminate={false}
                onChange={() => handleTypeToggle(type.value)}
              />
              <CheckboxLabel checked={checked} active={true}>
                {type.label}
              </CheckboxLabel>
            </CheckboxItem>
          );
        })}
      </FilterGroup>
      <FilterGroup>
        <GroupLabel>Project Stage:</GroupLabel>
        {PROJECT_STAGES.map((stage) => {
          const checked = (filter.stages || []).includes(stage.value);
          return (
            <CheckboxItem key={stage.value}>
              <Checkbox
                checked={checked}
                active={true}
                indeterminate={false}
                onChange={() => handleStageToggle(stage.value)}
              />
              <CheckboxLabel checked={checked} active={true}>
                {stage.label}
              </CheckboxLabel>
            </CheckboxItem>
          );
        })}
      </FilterGroup>
    </FilterBar>
  );
};

export default DashboardFilters;
