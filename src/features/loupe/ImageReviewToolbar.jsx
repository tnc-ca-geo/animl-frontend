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
  DotsHorizontalIcon,
  ClipboardCopyIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton.jsx';
import {
  labelsAdded,
  setMobileCategorySelectorFocus,
  setMobileCommentFocusIndex,
} from '../review/reviewSlice.js';
import {
  addLabelStart,
  selectIsDrawingBbox,
  selectIsAddingLabel,
  copyUrlToClipboard,
} from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice.js';
import {
  hasRole,
  WRITE_OBJECTS_ROLES,
  READ_COMMENTS_ROLES,
  WRITE_COMMENTS_ROLES,
} from '../auth/roles.js';
import { selectGlobalBreakpoint, selectSelectedProject } from '../projects/projectsSlice.js';
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
import { globalBreakpoints } from '../../config.js';
import { CommentsPopover } from './CommentsPopover.jsx';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLeft,
} from '../../components/Dropdown.jsx';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastViewport,
} from '../../components/Toast.jsx';
import { truncateString } from '../../app/utils.js';

const Badge = styled('div', {
  marginLeft: '$1',
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
    marginRight: '$1 !important',
    marginLeft: '$1 !important',
  },
});

const AnnotationControls = styled('div', {
  display: 'flex',
});

const LeftGroup = styled('div', {
  display: 'flex',
  alignItems: 'center',
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
  bboxesVisible = true,
  toggleBboxesVisible = () => {},
  isZoomed = false,
}) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const selectedProject = useSelector(selectSelectedProject);
  const dispatch = useDispatch();

  // Copy URL state and handler (for mobile overflow menu)
  const [showCopyToast, setShowCopyToast] = useState(false);
  const handleCopyUrl = () => {
    const allImagesView = selectedProject.views.find((v) => v.name === 'All images');
    const shareURL = `${window.location.origin}/app/${selectedProject._id}/${allImagesView._id}?img=${image._id}`;
    dispatch(copyUrlToClipboard(shareURL));
    setShowCopyToast(true);
  };

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
    <>
      <Toolbar
        // overflow x is needed because the toolbar is too wide on mobile
        // overflow x automatically sets overflow y which hides the
        // category menu
        css={toolbarScrollCss}
      >
        <LeftGroup>
          {hasRole(userRoles, WRITE_OBJECTS_ROLES) && (
            <AnnotationControls>
              {/* Repeat last action */}
              {!isSmallScreen && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToolbarIconButton
                        onClick={handleRepeatAction}
                        disabled={!lastAction || !bboxesVisible}
                      >
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

              {/* Edit all Labels */}
              <Tooltip>
                <TooltipTrigger asChild>
                  {!isSmallScreen && catSelectorOpen && bboxesVisible ? (
                    <CategorySelector handleCategoryChange={handleCategoryChange} />
                  ) : (
                    <ToolbarIconButton
                      onClick={handleEditAllLabelsButtonClick}
                      disabled={allObjectsLocked || image.awaitingPrediction || !bboxesVisible}
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

              {/* Validate/invalidate all Labels */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToolbarIconButton
                    onClick={(e) => handleValidateAllButtonClick(e, true)}
                    disabled={allObjectsLocked || image.awaitingPrediction || !bboxesVisible}
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
                    disabled={allObjectsLocked || image.awaitingPrediction || !bboxesVisible}
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

              {/* Add empty object */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToolbarIconButton
                    onClick={handleMarkEmptyButtonClick}
                    disabled={image.awaitingPrediction || !bboxesVisible}
                  >
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
                      <TooltipTrigger
                        asChild
                        disabled={isSmallScreen || image.awaitingPrediction || !bboxesVisible}
                      >
                        <ToolbarIconButton
                          onClick={handleAddObjectButtonClick}
                          disabled={!bboxesVisible || isZoomed}
                        >
                          <GroupIcon />
                        </ToolbarIconButton>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5}>
                        {isZoomed ? 'Reset zoom to draw new bounding boxes' : 'Add object'}
                        <TooltipArrow />
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Separator />
                </>
              )}

              {/* Unlock */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToolbarIconButton
                    onClick={handleUnlockAllButtonClick}
                    disabled={
                      allObjectsUnlocked ||
                      !hasRenderedObjects ||
                      image.awaitingPrediction ||
                      !bboxesVisible
                    }
                  >
                    <LockOpen1Icon />
                  </ToolbarIconButton>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  Unlock all objects
                  <TooltipArrow />
                </TooltipContent>
              </Tooltip>

              <Separator />

              {/* Toggle bbox visibility */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToolbarIconButton
                    onClick={toggleBboxesVisible}
                    data-state={bboxesVisible ? undefined : 'on'}
                  >
                    {bboxesVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                  </ToolbarIconButton>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={5}>
                  {bboxesVisible
                    ? 'Temporarily hide bounding boxes'
                    : 'Temporarily show bounding boxes'}
                  <TooltipArrow />
                </TooltipContent>
              </Tooltip>

              <Separator />

              {/* Comments / Small screen menu */}
              {isSmallScreen ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ToolbarIconButton css={{ position: 'relative' }}>
                      <DotsHorizontalIcon />
                    </ToolbarIconButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" sideOffset={5}>
                    <DropdownMenuItem
                      disabled={
                        !hasRole(userRoles, READ_COMMENTS_ROLES) ||
                        !hasRole(userRoles, WRITE_COMMENTS_ROLES)
                      }
                      onSelect={() => dispatch(setMobileCommentFocusIndex(image._id))}
                    >
                      <DropdownMenuItemIconLeft>
                        <ChatBubbleIcon />
                      </DropdownMenuItemIconLeft>
                      Comments
                      {image.comments?.length > 0 && <Badge>{image.comments?.length}</Badge>}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleCopyUrl}>
                      <DropdownMenuItemIconLeft>
                        <ClipboardCopyIcon />
                      </DropdownMenuItemIconLeft>
                      Copy image URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <CommentsPopover image={image} userRoles={userRoles} />
              )}
            </AnnotationControls>
          )}
        </LeftGroup>

        {/* Increment/Decrement image */}
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

      {/* Copy image URL toast (mobile overflow menu feedback) */}
      {showCopyToast && (
        <>
          <Toast open={showCopyToast} duration={2000} onOpenChange={() => setShowCopyToast(false)}>
            <ToastTitle variant="green" css={{ marginBottom: 0 }}>
              URL copied to clipboard
            </ToastTitle>
            <ToastDescription asChild>
              <div>
                {truncateString(
                  `${window.location.origin}/app/${selectedProject?._id}/${selectedProject?.views?.find((v) => v.name === 'All images')?._id}?img=${image._id}`,
                  40,
                )}
              </div>
            </ToastDescription>
            <ToastAction asChild altText="Dismiss">
              <IconButton variant="ghost">
                <Cross2Icon />
              </IconButton>
            </ToastAction>
          </Toast>
          <ToastViewport />
        </>
      )}
    </>
  );
};

export default ImageReviewToolbar;
