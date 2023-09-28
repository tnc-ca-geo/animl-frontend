import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { ToolbarRoot, ToolbarSeparator, ToolbarButton, ToolbarIconButton } from '../../components/Toolbar.jsx';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';
import {
  Pencil1Icon,
  PlusIcon,
  ValueNoneIcon,
  CheckIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { selectAvailLabels } from '../filters/filtersSlice.js';
import { labelsAdded } from '../review/reviewSlice.js';
import { addLabelStart, addLabelEnd, selectIsAddingLabel } from './loupeSlice.js';
import { selectUserUsername } from '../user/userSlice.js';

const StyledToolbarRoot = styled(ToolbarRoot, {
  marginTop: '$2'
});

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

const CategorySelector = ({ image, setCatSelectorOpen }) => {
  const username = useSelector(selectUserUsername);
  const dispatch = useDispatch();
  // update selector options when new labels become available
  const createOption = (category) => ({
    value: category.toLowerCase(),
    label: category,
  });
  const availLabels = useSelector(selectAvailLabels);
  const options = availLabels.ids.map((id) => createOption(id));

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    console.log('handleCategoryChange - newValue: ', newValue);
    const newLabels = image.objects.map((obj) => ({
        objIsTemp: obj.isTemp,
        userId: username,
        bbox: obj.bbox,
        category: newValue.value || newValue,
        objId: obj._id,
        imgId: image._id
    }));
    dispatch(labelsAdded({ labels: newLabels }));
    setCatSelectorOpen(false);
  };

  const handleCategorySelectorBlur = (e) => {
    dispatch(addLabelEnd());
    setCatSelectorOpen(false);
  };

  return (
    <StyledCategorySelector
      autoFocus
      isClearable
      isSearchable
      openMenuOnClick
      className='react-select'
      classNamePrefix='react-select'
      menuPlacement='top'
      filterOption={createFilter({ matchFrom: 'start' })} // TODO: what does this do?
      isLoading={availLabels.isLoading}
      isDisabled={availLabels.isLoading}
      onChange={handleCategoryChange}
      onCreateOption={handleCategoryChange}
      onBlur={handleCategorySelectorBlur}
      // value={createOption(label.category)}
      options={options}
    />
  );
}

const ImageReviewToolbar = ({
  image,
  handleValidateAllButtonClick,
  handleMarkEmptyButtonClick,
  handleAddObjectButtonClick
}) => {
  const dispatch = useDispatch();

  const [ catSelectorOpen, setCatSelectorOpen ] = useState(false);
  const handleEditAllLabelsButtonClick = (e) => {
    e.stopPropagation();
    dispatch(addLabelStart());
    setCatSelectorOpen(true);
  };

  return (
    <StyledToolbarRoot aria-label="Formatting options">
      {catSelectorOpen
        ? (<CategorySelector 
            image={image} 
            setCatSelectorOpen={setCatSelectorOpen}
          />)
        : (<ToolbarIconButton onClick={handleEditAllLabelsButtonClick}>
            <Pencil1Icon /> Edit labels
          </ToolbarIconButton>)
      }
      <ToolbarSeparator />
      <ToolbarIconButton onClick={(e) => handleValidateAllButtonClick(e, true)}>
        <CheckIcon /> Validate
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={(e) => handleValidateAllButtonClick(e, false)}>
        <Cross2Icon /> Invalidate
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={handleMarkEmptyButtonClick}>
        <ValueNoneIcon /> Mark empty
      </ToolbarIconButton>
      <ToolbarSeparator />
      <ToolbarIconButton onClick={handleAddObjectButtonClick}>
        <PlusIcon /> Add object
      </ToolbarIconButton>
      {/* <ToolbarButton css={{ marginLeft: 'auto' }}>Share</ToolbarButton> */}
    </StyledToolbarRoot>
  );
};

export default ImageReviewToolbar;