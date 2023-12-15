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
  LockOpen1Icon,
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@radix-ui/react-icons';
import { selectAvailLabels } from '../filters/filtersSlice.js';
import IconButton from '../../components/IconButton.jsx';
import { labelsAdded } from '../review/reviewSlice.js';
import { addLabelStart, addLabelEnd, selectIsDrawingBbox, selectIsAddingLabel } from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles.js';
import { violet, blackA, mauve } from '@radix-ui/colors';
import Button from '../../components/Button.jsx';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipArrow, 
  TooltipTrigger
} from '../../components/Tooltip.jsx';
import { KeyboardKeyHint } from '../../components/KeyboardKeyHint.jsx';
import CategorySelector from '../../components/CategorySelector.jsx';


const Toolbar = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '$2',
  width: '100%',
  minWidth: 'max-content',
  borderBottom: '1px solid $border'
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

const AnnotationControls = styled('div', {
  display: 'flex'
});

const IncrementControls = styled('div', {
  display: 'flex',
  padding: '$0 $2 $0 $1',
});

const CancelHint = styled('div', {
  ...itemStyles,
  '&:hover': {
    backgroundColor: '$background',
    color: mauve.mauve11,
    cursor: 'default'
  },
});

const ImageReviewToolbar = ({
  image,
  lastAction,
  handleRepeatAction,
  handleValidateAllButtonClick,
  handleMarkEmptyButtonClick,
  handleAddObjectButtonClick,
  handleUnlockAllButtonClick,
  handleIncrementClick,
}) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const dispatch = useDispatch();

  // manage category selector state (open/closed)
  const isAddingLabel = useSelector(selectIsAddingLabel);
  const [ catSelectorOpen, setCatSelectorOpen ] = useState((isAddingLabel === 'from-review-toolbar'));
  useEffect(() => {
    setCatSelectorOpen(((isAddingLabel === 'from-review-toolbar')));
  }, [isAddingLabel]);

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    const newLabels = image.objects
      .filter((obj) => !obj.locked)
      .map((obj) => ({
        objIsTemp: obj.isTemp,
        userId,
        bbox: obj.bbox,
        category: newValue.value || newValue,
        objId: obj._id,
        imgId: image._id
      }));
    dispatch(labelsAdded({ labels: newLabels }));
  };

  const handleEditAllLabelsButtonClick = (e) => {
    e.stopPropagation();
    dispatch(addLabelStart('from-review-toolbar'));
  };

  const allObjectsLocked = image.objects && image.objects.every((obj) => obj.locked);
  const allObjectsUnlocked = image.objects && image.objects.every((obj) => !obj.locked);
  const hasRenderedObjects = image.objects && image.objects.some((obj) => (
    obj.labels.some((lbl) => (
      lbl.validation === null || lbl.validation.validated
    ))
  ));
  
  return (
    <Toolbar>
      {hasRole(userRoles, WRITE_OBJECTS_ROLES) &&
        <AnnotationControls>
          {/* Repeat last action */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ToolbarIconButton
                onClick={handleRepeatAction}
                disabled={!lastAction}
              >
                <ReloadIcon />
              </ToolbarIconButton>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5} >
              Repeat last action
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>

          <Separator />

          {/* Edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              {catSelectorOpen
                ? (<CategorySelector
                    handleCategoryChange={handleCategoryChange} 
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

          {/* Validate/invalidate */}
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
          
          {/* Mark empty */}
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

          {/* Add object */}
          {isDrawingBbox 
            ? <CancelHint>
                <KeyboardKeyHint css={{ marginRight: '4px' }}>esc</KeyboardKeyHint>
                <span style={{ paddingBottom: '2px' }}>to cancel</span>
              </CancelHint>
            : <Tooltip>
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
          }
          
          <Separator />

          {/* Unlock */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ToolbarIconButton
                onClick={handleUnlockAllButtonClick}
                disabled={allObjectsUnlocked || !hasRenderedObjects}
              >
                <LockOpen1Icon />
              </ToolbarIconButton>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5} >
              Unlock all objects
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        </AnnotationControls>
      }

      {/* Increment/Decrement */}
      <IncrementControls>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <IconButton
                variant='ghost'
                size='med'
                onClick={() => handleIncrementClick('decrement')}
              >
                <ChevronLeftIcon/>
              </IconButton>
              <IconButton
                variant='ghost'
                size='med'
                onClick={() => handleIncrementClick('increment')}
              >
                <ChevronRightIcon/>
              </IconButton>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={5} >
            Hint: you can use the <KeyboardKeyHint>WASD</KeyboardKeyHint> or <KeyboardKeyHint>arrow</KeyboardKeyHint> keys to navigate images
            <TooltipArrow />
          </TooltipContent>
        </Tooltip>
      </IncrementControls>
    </Toolbar>
  );
};

export default ImageReviewToolbar;