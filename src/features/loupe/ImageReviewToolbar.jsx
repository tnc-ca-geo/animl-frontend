import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import CreatableSelect from 'react-select/creatable';
import { createFilter } from 'react-select';
import {
  Pencil1Icon,
  GroupIcon,
  ValueNoneIcon,
  CheckIcon,
  Cross2Icon,
} from '@radix-ui/react-icons';
import { selectAvailLabels } from '../filters/filtersSlice.js';
import { labelsAdded } from '../review/reviewSlice.js';
import { addLabelStart, addLabelEnd, selectIsAddingLabel } from './loupeSlice.js';
import { selectUserUsername } from '../user/userSlice.js';
import { violet, blackA, mauve } from '@radix-ui/colors';
import Button from '../../components/Button.jsx';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip.jsx';


const Toolbar = styled('div', {
  marginTop: '$2',
  display: 'flex',
  padding: 10,
  width: '100%',
  minWidth: 'max-content',
  borderRadius: 6,
  backgroundColor: 'white',
  boxShadow: `0 2px 10px ${blackA.blackA7}`,
});

export const itemStyles = {
  all: 'unset',
  flex: '0 0 auto',
  color: mauve.mauve11,
  height: 32,
  padding: '0 5px',
  borderRadius: 4,
  display: 'inline-flex',
  fontSize: 13,
  lineHeight: 1,
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': { backgroundColor: violet.violet3, color: violet.violet11, cursor: 'pointer' },
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px ${violet.violet7}` },
};

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

const ToolbarIconButton = styled(Button, {
  ...itemStyles,
  backgroundColor: 'white',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&[data-state=on]': { backgroundColor: violet.violet5, color: violet.violet11 },
  svg: {
    marginRight: '$1',
    marginLeft: '$1'
  }
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
    console.log('handleCategoryChange - image.objects: ', image.objects);
    const newLabels = image.objects
      .filter((obj) => !obj.locked)
      .map((obj) => ({
        objIsTemp: obj.isTemp,
        userId: username,
        bbox: obj.bbox,
        category: newValue.value || newValue,
        objId: obj._id,
        imgId: image._id
      }));
    console.log('handleCategoryChange - newLabels: ', newLabels);
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

  const allObjectsLocked = image.objects && image.objects.every((obj) => obj.locked);
  
  return (
    <Toolbar>

      <Tooltip>
        <TooltipTrigger asChild>
          {catSelectorOpen
            ? (<CategorySelector 
                image={image} 
                setCatSelectorOpen={setCatSelectorOpen}
              />)
            : (<ToolbarIconButton
                onClick={handleEditAllLabelsButtonClick}
                disabled={allObjectsLocked}
              >
                <Pencil1Icon />
              </ToolbarIconButton>)
          }
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Edit all labels
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Separator />

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton
            onClick={(e) => handleValidateAllButtonClick(e, true)}
            disabled={allObjectsLocked}
          >
            <CheckIcon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Validate all labels
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton
            onClick={(e) => handleValidateAllButtonClick(e, false)}
            disabled={allObjectsLocked}
          >
            <Cross2Icon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Invalidate all labels
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Separator />

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton onClick={handleMarkEmptyButtonClick}>
            <ValueNoneIcon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Mark empty
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      <Separator />

      <Tooltip>
        <TooltipTrigger asChild>
          <ToolbarIconButton onClick={handleAddObjectButtonClick}>
            <GroupIcon />
          </ToolbarIconButton>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={5} >
          Add object
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>

      {/* <ToolbarButton css={{ marginLeft: 'auto' }}>Share</ToolbarButton> */}
    </Toolbar>
  );
};

export default ImageReviewToolbar;