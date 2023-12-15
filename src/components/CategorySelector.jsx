import React, { forwardRef } from 'react';
import { styled } from '../theme/stitches.config.js';
import { useSelector, useDispatch } from 'react-redux';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';
import { selectAvailLabels } from '../features/filters/filtersSlice.js';
import { addLabelEnd } from '../features/loupe/loupeSlice.js';


const StyledCategorySelector = styled(CreatableSelect, {
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
  }
});


const CategorySelector = forwardRef(({ 
  css,
  handleCategoryChange,
  handleCategorySelectorBlur,
  menuPlacement='top'
}, ref) => {

  // update selector options when new labels become available
  const createOption = (category) => ({ value: category.toLowerCase(), label: category });
  const availLabels = useSelector(selectAvailLabels);
  const options = availLabels.ids.map((id) => createOption(id));
  const dispatch = useDispatch();

  const defaultHandleBlur = (e) => dispatch(addLabelEnd());

  return (
    <StyledCategorySelector
      ref={ref}
      css={css}
      autoFocus
      isClearable
      isSearchable
      openMenuOnClick
      className='react-select'
      classNamePrefix='react-select'
      menuPlacement={menuPlacement}
      filterOption={createFilter({ matchFrom: 'start' })}
      isLoading={availLabels.isLoading}
      isDisabled={availLabels.isLoading}
      onChange={handleCategoryChange}
      onCreateOption={handleCategoryChange}
      onBlur={handleCategorySelectorBlur || defaultHandleBlur}
      options={options}
    />
  );
});

export default CategorySelector;