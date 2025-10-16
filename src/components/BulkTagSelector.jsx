import React, { forwardRef } from 'react';
import { styled } from '../theme/stitches.config.js';
import { useSelector, useDispatch } from 'react-redux';
import Select, { createFilter } from 'react-select';
import {
  selectSelectedProject,
  selectProjectTagsLoading,
  selectGlobalBreakpoint,
} from '../features/projects/projectsSlice.js';
import { addTagEnd } from '../features/loupe/loupeSlice.js';
import { globalBreakpoints } from '../config.js';

const StyledBulkTagSelector = styled(Select, {
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

const BulkTagSelector = forwardRef(function BulkTagSelector(
  { css, handleTagChange, handleBulkTagSelectorBlur, menuPlacement = 'top' },
  ref,
) {
  // update selector options when new labels become available
  const projectTagsLoading = useSelector(selectProjectTagsLoading);
  const createOption = (tag) => ({
    value: tag._id,
    label: tag.name,
  });
  // TODO: for bulk tag selector we can't see if the tag is already applied to the image,
  // so test what happens if we try to add a tag that is already applied to the image.
  const tags = useSelector(selectSelectedProject).tags;
  const options = tags.map(createOption);
  const dispatch = useDispatch();

  const defaultHandleBlur = () => dispatch(addTagEnd());

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  return (
    <StyledBulkTagSelector
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
      isLoading={projectTagsLoading.isLoading}
      isDisabled={projectTagsLoading.isLoading}
      onChange={handleTagChange}
      onBlur={handleBulkTagSelectorBlur || defaultHandleBlur}
      options={options}
      maxMenuHeight={isSmallScreen ? 200 : undefined}
    />
  );
});

export default BulkTagSelector;
