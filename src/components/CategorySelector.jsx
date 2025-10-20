import React, { forwardRef } from 'react';
import { styled } from '../theme/stitches.config.js';
import { useSelector, useDispatch } from 'react-redux';
import Select, { createFilter } from 'react-select';
import {
  selectSelectedProject,
  selectProjectLabelsLoading,
  selectGlobalBreakpoint,
} from '../features/projects/projectsSlice.js';
import { addLabelEnd } from '../features/loupe/loupeSlice.js';
import { globalBreakpoints } from '../config.js';

const StyledCategorySelector = styled(Select, {
  width: '155px',
  fontFamily: '$mono',
  fontSize: '$2',
  fontWeight: '$1',
  zIndex: '$5',
  '.react-select__control': {
    boxSizing: 'border-box',
    // height: '24px',
    minHeight: 'unset',
    border: '1px solid',
    borderColor: '$border',
    borderRadius: '$2',
    cursor: 'pointer',
  },
  '.react-select__single-value': {
    // position: 'relative',
  },
  '.react-select__indicator-separator': {
    display: 'none',
  },
  '.react-select__dropdown-indicator': {
    paddingTop: '0',
    paddingBottom: '0',
  },
  '.react-select__control--is-focused': {
    transition: 'all 0.2s ease',
    boxShadow: '0 0 0 3px $blue200',
    borderColor: '$blue500',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '.react-select__menu': {
    color: '$textDark',
    fontSize: '$3',
    '.react-select__option': {
      cursor: 'pointer',
    },
    '.react-select__option--is-selected': {
      color: '$blue500',
      backgroundColor: '$blue200',
    },
    '.react-select__option--is-focused': {
      backgroundColor: '$gray3',
    },
  },
});

// Compare function for alphabetical order
export const compareLabelNames = (lbl1Name, lbl2Name) => {
  lbl1Name = lbl1Name.toLowerCase();
  lbl2Name = lbl2Name.toLowerCase();
  if (lbl1Name < lbl2Name) {
    return -1;
  } else if (lbl1Name > lbl2Name) {
    return 1;
  } else {
    return 0;
  }
};

const CategorySelector = forwardRef(function CategorySelector(
  { css, handleCategoryChange, handleCategorySelectorBlur, menuPlacement = 'top' },
  ref,
) {
  // update selector options when new labels become available
  const labelsLoading = useSelector(selectProjectLabelsLoading);
  const createOption = (category) => ({
    value: category._id,
    label: category.name,
  });
  const enabledLabels = useSelector(selectSelectedProject).labels.filter(
    (lbl) => lbl.reviewerEnabled,
  );
  const options = enabledLabels
    .sort((lbl1, lbl2) => compareLabelNames(lbl1.name, lbl2.name))
    .map(createOption);

  const dispatch = useDispatch();

  const defaultHandleBlur = () => dispatch(addLabelEnd());

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <StyledCategorySelector
      ref={ref}
      css={css}
      autoFocus
      isClearable
      isSearchable
      openMenuOnClick
      className="react-select"
      classNamePrefix="react-select"
      menuPlacement={menuPlacement}
      filterOption={createFilter({ matchFrom: 'start' })}
      isLoading={labelsLoading.isLoading}
      isDisabled={labelsLoading.isLoading}
      onChange={handleCategoryChange}
      onBlur={handleCategorySelectorBlur || defaultHandleBlur}
      options={options}
      maxMenuHeight={isSmallScreen ? 200 : undefined}
    />
  );
});

export default CategorySelector;
