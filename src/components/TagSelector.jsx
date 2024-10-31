import React from 'react';
import { styled } from '../theme/stitches.config.js';
import { useSelector, useDispatch } from 'react-redux';
import Select, { createFilter } from 'react-select';
import {
  selectProjectTags,
  selectTagsLoading
} from '../features/projects/projectsSlice.js';
import { addLabelEnd } from '../features/loupe/loupeSlice.js';

const StyledTagSelector = styled(Select, {
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

export const TagSelector = ({
  css,
  handleTagChange,
  handleTagChangeBlur,
  menuPlacement = 'top',
}) => {
  const tagsLoading = useSelector(selectTagsLoading);
  const tags = useSelector(selectProjectTags);
  const options = tags.map((tag) => {
    return {
      value: tag._id,
      label: tag.name
    }
  });
  const dispatch = useDispatch();
  const defaultHandleBlur = () => dispatch(addLabelEnd());

  return (
    <StyledTagSelector
      value={""}
      css={css}
      autoFocus
      isClearable
      isSearchable
      openMenuOnClick
      className="react-select"
      classNamePrefix="react-select"
      menuPlacement={menuPlacement}
      filterOption={createFilter({ matchFrom: 'start' })}
      isLoading={tagsLoading.isLoading}
      isDisabled={tagsLoading.isLoading}
      onChange={handleTagChange}
      onBlur={handleTagChangeBlur || defaultHandleBlur}
      options={options}
    />
  );
};
