import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  Pencil1Icon,
  GroupIcon,
  ValueNoneIcon,
  CheckIcon,
  Cross2Icon,
  LockOpen1Icon,
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChatBubbleIcon,
} from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton.jsx';
import {
  labelsAdded,
  setMobileCategorySelectorFocus,
  setMobileCommentFocusIndex,
} from '../review/reviewSlice.js';
import { addLabelStart, selectIsDrawingBbox, selectIsAddingLabel } from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice.js';
import {
  hasRole,
  WRITE_OBJECTS_ROLES,
  READ_COMMENT_ROLES,
  WRITE_COMMENT_ROLES,
} from '../auth/roles.js';
import { violet, mauve, indigo } from '@radix-ui/colors';
import Button from '../../components/Button.jsx';
import { KeyboardKeyHint } from '../../components/KeyboardKeyHint.jsx';
import CategorySelector from '../../components/CategorySelector.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { selectGlobalBreakpoint } from '../projects/projectsSlice.js';
import { globalBreakpoints } from '../../config.js';
import { CommentsPopover } from './CommentsPopover.jsx';
import ShareImageButton from './ShareImageButton.jsx';

const Badge = styled('div', {
  position: 'absolute',
  top: 1,
  left: 18,
  background: indigo.indigo4,
  fontSize: '$1',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $1',
  borderRadius: '$2',
});

const Toolbar = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '$2',
  borderBottom: '1px solid $border',
  width: '100dvw',
  '@bp1': {
    width: '100%',
    minWidth: 'max-content',
  },
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
  '&:hover': {
    backgroundColor: violet.violet3,
    color: violet.violet11,
    cursor: 'pointer',
  },
  '&:focus': { position: 'relative', boxShadow: `0 0 0 2px ${violet.violet7}` },
};

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
  margin: '0 10px',
});

export const ToolbarIconButton = styled(Button, {
  ...itemStyles,
  backgroundColor: '$background',
  marginLeft: 2,
  '&:first-child': { marginLeft: 0 },
  '&[data-state=on]': {
    backgroundColor: violet.violet5,
    color: violet.violet11,
  },
  svg: {
    marginRight: '$1',
    marginLeft: '$1',
  },
});

const AnnotationControls = styled('div', {
  display: 'flex',
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
    cursor: 'default',
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
  // On mobile, each image in a single column has its own instanc of an
  // image review toolbar so when the redux state is updated, all of the
  // toolbars respond to the change.  This local state scopes the
  // behavior to the toolbar where the action occurred.
  const [catSelectorOpen, setCatSelectorOpen] = useState(isAddingLabel === 'from-review-toolbar');
  useEffect(() => {
    setCatSelectorOpen(isAddingLabel === 'from-review-toolbar');
  }, [isAddingLabel]);

  const handleCategoryChange = (newValue) => {
    if (!newValue) return;
    const newLabels = image.objects
      .filter((obj) => !obj.locked)
      .map((obj) => ({
        objIsTemp: obj.isTemp,
        userId,
        bbox: obj.bbox,
        labelId: newValue.value || newValue,
        objId: obj._id,
        imgId: image._id,
      }));
    dispatch(labelsAdded({ labels: newLabels }));
  };

  const handleEditAllLabelsButtonClick = (e) => {
    e.stopPropagation();
    if (isSmallScreen) {
      dispatch(setMobileCategorySelectorFocus({ imageId: image._id, objectId: null }));
    } else {
      dispatch(addLabelStart('from-review-toolbar'));
    }
  };

  const allObjectsLocked = image.objects && image.objects.every((obj) => obj.locked);
  const allObjectsUnlocked = image.objects && image.objects.every((obj) => !obj.locked);
  const hasRenderedObjects =
    image.objects &&
    image.objects.some((obj) =>
      obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
    );

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  const toolbarScrollCss = isSmallScreen
    ? catSelectorOpen
      ? { overflowX: 'unset' }
      : { overflowX: 'scroll' }
    : {};

  return (
    <Toolbar
      // overflow x is needed because the toolbar is too wide on mobile
      // overflow x automatically sets overflow y which hides the
      // category menu
      css={toolbarScrollCss}
    >
      {hasRole(userRoles, WRITE_OBJECTS_ROLES) && (
        <AnnotationControls>
          {/* Repeat last action */}
          {!isSmallScreen && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToolbarIconButton onClick={handleRepeatAction} disabled={!lastAction}>
                    <ReloadIcon />
                  </ToolbarIconButton>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  Repeat last action
                  <TooltipArrow />
                </TooltipContent>
              </Tooltip>

              <Separator />
            </>
          )}

          {/* Edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              {!isSmallScreen && catSelectorOpen ? (
                <CategorySelector handleCategoryChange={handleCategoryChange} />
              ) : (
                <ToolbarIconButton
                  onClick={handleEditAllLabelsButtonClick}
                  disabled={allObjectsLocked}
                >
                  <Pencil1Icon />
                </ToolbarIconButton>
              )}
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
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
            <TooltipContent side="top" sideOffset={5}>
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
            <TooltipContent side="top" sideOffset={5}>
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
            <TooltipContent side="top" sideOffset={5}>
              Mark empty
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>

          <Separator />

          {/* Add object */}
          {!isSmallScreen && (
            <>
              {isDrawingBbox ? (
                <CancelHint>
                  <KeyboardKeyHint css={{ marginRight: '4px' }}>esc</KeyboardKeyHint>
                  <span style={{ paddingBottom: '2px' }}>to cancel</span>
                </CancelHint>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild disabled={isSmallScreen}>
                    <ToolbarIconButton onClick={handleAddObjectButtonClick}>
                      <GroupIcon />
                    </ToolbarIconButton>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={5}>
                    Add object
                    <TooltipArrow />
                  </TooltipContent>
                </Tooltip>
              )}
              <Separator />
            </>
          )}

          {/* Comments */}
          {isSmallScreen ? (
            <ToolbarIconButton
              disabled={
                !hasRole(userRoles, READ_COMMENT_ROLES) || !hasRole(userRoles, WRITE_COMMENT_ROLES)
              }
              css={{ position: 'relative' }}
              onClick={() => dispatch(setMobileCommentFocusIndex(image._id))}
            >
              <ChatBubbleIcon />
              {image.comments?.length > 0 && <Badge>{image.comments?.length}</Badge>}
            </ToolbarIconButton>
          ) : (
            <CommentsPopover image={image} userRoles={userRoles} />
          )}

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
            <TooltipContent side="top" sideOffset={5}>
              Unlock all objects
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>

          {/* On mobile, include the share button as well */}
          {isSmallScreen && (
            <>
              <Separator />
              <ShareImageButton imageId={image._id} />
            </>
          )}
        </AnnotationControls>
      )}

      {/* Increment/Decrement */}
      {handleIncrementClick !== undefined && (
        <IncrementControls>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <IconButton
                  variant="ghost"
                  size="med"
                  onClick={() => handleIncrementClick('decrement')}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  variant="ghost"
                  size="med"
                  onClick={() => handleIncrementClick('increment')}
                >
                  <ChevronRightIcon />
                </IconButton>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={5}>
              Hint: you can use the <KeyboardKeyHint>WASD</KeyboardKeyHint> or{' '}
              <KeyboardKeyHint>arrow</KeyboardKeyHint> keys to navigate images
              <TooltipArrow />
            </TooltipContent>
          </Tooltip>
        </IncrementControls>
      )}
    </Toolbar>
  );
};

export default ImageReviewToolbar;
