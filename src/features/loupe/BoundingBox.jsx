import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import _ from 'lodash';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuItemIconLeft,
} from '../../components/ContextMenu';
import {
  bboxUpdated,
  labelsValidated,
  setFocus,
  objectsManuallyUnlocked,
} from '../review/reviewSlice';
import { addLabelStart } from './loupeSlice';
import BoundingBoxLabel from './BoundingBoxLabel';
import { absToRel, relToAbs } from '../../app/utils';
import { CheckIcon, Cross2Icon, LockOpen1Icon, Pencil1Icon } from '@radix-ui/react-icons';
import { selectLabels } from '../projects/projectsSlice';

const ResizeHandle = styled('div', {
  width: '$3',
  height: '$3',
  display: 'inline-block',
  position: 'absolute',
  variants: {
    location: {
      sw: {
        bottom: '0',
        left: '0',
        cursor: 'sw-resize',
      },
      se: {
        bottom: '0',
        right: '0',
        cursor: 'se-resize',
      },
      nw: {
        top: '0',
        left: '0',
        cursor: 'nw-resize',
      },
      ne: {
        top: '0',
        right: '0',
        cursor: 'ne-resize',
      },
    },
  },
});

const DragHandle = styled('div', {
  margin: '$3',
  width: 'calc(100% - 32px)', // stitches bug w/ parsing variables in calc
  height: 'calc(100% - 32px)',

  variants: {
    disabled: {
      true: {
        '&:hover': {
          cursor: 'default',
        },
        '&:user-select': {
          cursor: 'default',
        },
      },
      false: {
        '&:hover': {
          cursor: 'grab',
        },
        '&:user-select': {
          cursor: 'grabbing',
        },
      },
    },
  },
});

const StyledResizableBox = styled(ResizableBox, {
  boxSizing: 'border-box',
  position: 'absolute !important;',
  border: '2px solid #00C797',
  // zIndex: '$2',
  variants: {
    selected: {
      true: {
        zIndex: '$3',
        // opacity: '1',
        // outline: 'none',
        // boxShadow: '0 0 0 3px $blue200',
        // borderColor: '$blue500',
      },
      false: {
        // opacity: '0.85',
      },
    },
    locked: {
      true: {
        borderStyle: 'solid',
      },
      false: {
        borderStyle: 'dashed',
      },
    },
  },
});

const BoundingBox = ({ imgId, imgDims, object, objectIndex, focusIndex, setTempObject }) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const username = useSelector(selectUserUsername);
  const isAuthorized = hasRole(userRoles, WRITE_OBJECTS_ROLES);
  const handleRef = useRef(null);
  const catSelectorRef = useRef(null);
  const focusRef = useRef(null);
  const dispatch = useDispatch();
  const dragRef = useRef(null);

  // track whether the object is focused
  const objectFocused = object.isTemp || focusIndex.object === objectIndex;

  // show first non-invalidated label in array
  let label = object.labels.find((lbl) => lbl.validation === null || lbl.validation.validated);
  if (object.locked) {
    // unless object is locked, in which case show first validated label
    label = object.labels.find((lbl) => lbl.validation && lbl.validation.validated);
  } else if (object.isTemp) {
    // or object is being added
    label = { category: '', conf: 0, index: 0 };
  } else if (objectFocused && focusIndex.label) {
    // or obj & label are focused
    label = object.labels[focusIndex.label];
  }

  const fallbackLabel = { _id: 'fallback_label', name: 'ERROR FINDING LABEL', color: '#E54D2E' };
  const projectLabels = useSelector(selectLabels);
  const displayLabel = projectLabels?.find(({ _id }) => _id === label.labelId) || fallbackLabel;
  const conf = Number.parseFloat(label.conf * 100).toFixed(1);

  // set index
  let labelIndex = object.labels.indexOf(label);
  labelIndex = labelIndex !== -1 ? labelIndex : null;
  const index = {
    image: focusIndex.image,
    object: objectIndex,
    label: labelIndex,
  };

  // track bounding box dimensions
  const [bbox, setBbox] = useState(object.bbox);
  let { left, top, width, height } = relToAbs(bbox, imgDims.width, imgDims.height);
  useEffect(() => {
    setBbox(object.bbox);
  }, [object.bbox]);

  const onDrag = (event, { deltaX, deltaY }) => {
    const rect = { left: left + deltaX, top: top + deltaY, width, height };
    const newBbox = absToRel(rect, imgDims);
    setBbox(newBbox);
  };

  const [lastBbox, setLastBbox] = useState(object.bbox);
  const onDragStart = () => {
    setLastBbox(bbox);
  };

  const onDragEnd = () => {
    if (!_.isEqual(lastBbox, bbox)) {
      dispatch(bboxUpdated({ imgId, objId: object._id, bbox }));
    }
  };

  const [constraintX, setConstraintX] = useState(Infinity);
  const [constraintY, setConstraintY] = useState(Infinity);
  const onResize = (event, { size, handle }) => {
    // drags from left or top handles require repositioning the box.
    // bottom & right can be left alone
    if (['n', 'w', 'ne', 'nw', 'sw'].includes(handle)) {
      if (handle.indexOf('n') > -1) {
        const deltaHeight = size.height - height;
        top -= deltaHeight;
      }
      if (handle.indexOf('w') > -1) {
        const deltaWidth = size.width - width;
        left -= deltaWidth;
      }
    }

    // Prevent box from going out of bounds
    const right = imgDims.width - size.width - left;
    const bottom = imgDims.height - size.height - top;
    if (handle.indexOf('e') > -1 && right <= 0) setConstraintX(width);
    if (handle.indexOf('w') > -1 && left <= 0) setConstraintX(width);
    if (handle.indexOf('n') > -1 && top <= 0) setConstraintY(height);
    if (handle.indexOf('s') > -1 && bottom <= 0) setConstraintY(height);

    const rect = { left, top, width: size.width, height: size.height };
    const newBbox = absToRel(rect, imgDims);
    setBbox(newBbox);
  };

  const onResizeStop = () => {
    setConstraintX(Infinity);
    setConstraintY(Infinity);
    dispatch(bboxUpdated({ imgId, objId: object._id, bbox }));
  };

  // manage label validation button state
  const [showLabelButtons, setShowLabelButtons] = useState(false);
  const handleBBoxHover = () => setShowLabelButtons(true);
  const handleBBoxMouseLeave = () => setShowLabelButtons(false);

  const handleBBoxClick = () => dispatch(setFocus({ index, type: 'manual' }));

  const handleValidationMenuItemClick = (e, validated) => {
    e.stopPropagation();
    dispatch(
      labelsValidated({
        labels: [
          {
            userId: username,
            imgId,
            objId: object._id,
            lblId: label._id,
            validated,
          },
        ],
      }),
    );
  };

  const handleEditLabelMenuItemClick = (e) => {
    e.stopPropagation();
    // NOTE: if user selects the "edit label" item, we need to force
    // focus to shift to the react-select category selector component.
    // see https://github.com/radix-ui/primitives/issues/1446
    focusRef.current = catSelectorRef.current;
    console.log('focusRef.current: ', focusRef.current);
    const newIndex = { image: focusIndex.image, object: objectIndex, label: null };
    dispatch(setFocus({ index: newIndex, type: 'manual' }));
    dispatch(addLabelStart('from-object'));
  };

  const handleUnlockMenuItemClick = (e) => {
    e.stopPropagation();
    dispatch(objectsManuallyUnlocked({ objects: [{ imgId, objId: object._id }] }));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={!isAuthorized}>
        <Draggable
          bounds=".image-frame"
          handle=".drag-handle"
          position={{ x: left, y: top }}
          onStart={onDragStart}
          onDrag={onDrag}
          onStop={onDragEnd}
          disabled={!isAuthorized || object.locked}
          nodeRef={dragRef}
        >
          <StyledResizableBox
            ref={dragRef}
            width={width}
            height={height}
            minConstraints={[0, 0]}
            maxConstraints={[constraintX, constraintY]}
            resizeHandles={isAuthorized && !object.locked ? ['sw', 'se', 'nw', 'ne'] : []}
            handle={(location) => (
              <ResizeHandle
                location={location}
                ref={(el) => {
                  if (location === 'se') {
                    handleRef.current = el;
                  }
                }}
              />
            )}
            onResize={onResize}
            onResizeStop={onResizeStop}
            onClick={handleBBoxClick}
            onMouseOver={handleBBoxHover}
            onMouseEnter={handleBBoxHover}
            onMouseLeave={handleBBoxMouseLeave}
            selected={objectFocused}
            locked={object.locked}
            css={{
              borderColor: displayLabel?.color,
              background: displayLabel?.color + '0D',
            }}
          >
            <>
              {label && (
                <BoundingBoxLabel
                  imgId={imgId}
                  index={index}
                  object={object}
                  label={label}
                  displayLabel={displayLabel}
                  conf={conf}
                  selected={objectFocused}
                  showLabelButtons={showLabelButtons}
                  setTempObject={setTempObject}
                  verticalPos={top > 30 ? 'top' : 'bottom'}
                  horizontalPos={imgDims.width - left - width < 75 ? 'right' : 'left'}
                  ref={catSelectorRef}
                  isAuthorized={isAuthorized}
                  username={username}
                />
              )}
              <DragHandle className="drag-handle" disabled={!isAuthorized || object.locked} />
            </>
          </StyledResizableBox>
        </Draggable>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => {
          // NOTE: if user selects the "edit label" item, we need to force
          // focus to shift to the react-select category selector component
          if (focusRef.current) {
            e.preventDefault();
            focusRef.current.focus();
            focusRef.current = null;
          }
        }}
        sideOffset={5}
        align="end"
      >
        <ContextMenuItem
          onClick={(e) => handleValidationMenuItemClick(e, true)}
          disabled={object.locked}
          css={{
            color: '$successText',
            '&[data-highlighted]': {
              backgroundColor: '$successBase',
              color: '$successBg',
            },
          }}
        >
          <ContextMenuItemIconLeft>
            <CheckIcon />
          </ContextMenuItemIconLeft>
          Validate
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={(e) => handleValidationMenuItemClick(e, false)}
          disabled={object.locked}
          css={{
            color: '$errorText',
            '&[data-highlighted]': {
              backgroundColor: '$errorBase',
              color: '$errorBg',
            },
          }}
        >
          <ContextMenuItemIconLeft>
            <Cross2Icon />
          </ContextMenuItemIconLeft>
          Invalidate
        </ContextMenuItem>
        <ContextMenuItem
          className="edit-label-menu-item"
          onSelect={handleEditLabelMenuItemClick}
          disabled={object.locked}
        >
          <ContextMenuItemIconLeft>
            <Pencil1Icon />
          </ContextMenuItemIconLeft>
          Edit label
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={handleUnlockMenuItemClick} disabled={!object.locked}>
          <ContextMenuItemIconLeft>
            <LockOpen1Icon />
          </ContextMenuItemIconLeft>
          Unlock
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default BoundingBox;
