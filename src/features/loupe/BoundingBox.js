import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { styled, labelColors } from '../../theme/stitches.config';
import _ from 'lodash';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { bboxUpdated, setFocus } from '../review/reviewSlice';
import BoundingBoxLabel from './BoundingBoxLabel';
import { absToRel, relToAbs } from '../../app/utils';

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
        cursor: 'se-resize'
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
      }
    }
  }
});

const DragHandle = styled('div', {
  margin: '$3',
  width: 'calc(100% - 32px)', // stitches bug w/ parsing variables in calc
  height: 'calc(100% - 32px)',
  '&:hover': {
    cursor: 'grab',
  },
  '&:user-select': {
    cursor: 'grabbing',
  }
});

const StyledResizableBox = styled(ResizableBox, {
  boxSizing: 'border-box',
  position: 'absolute !important;',
  border: '2px solid #345EFF',
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
    }
  }
});

const BoundingBox = ({ 
  imageId,
  imageWidth,
  imageHeight,
  object,
  objectIndex,
  focusIndex,
  setTempObject
}) => {
  const handleRef = useRef(null);
  const dispatch = useDispatch();

  // track whether the object is focused
  const [ objectFocused, setObjectFocused ] = useState();
  useEffect(() => {
    const focused = object.isBeingAdded || focusIndex.object === objectIndex;
    setObjectFocused(focused);
  }, [ object.isBeingAdded, focusIndex.object, objectIndex ]);

  // set label - maybe move this to label component?
  const [ label, setLabel ] = useState();
  useEffect(() => {
    // show first non-invalidated label in array
    let newLabel = object.labels.find((label) => (
      label.validation === null || label.validation.validated 
    ));
    if (object.isBeingAdded) { // unless object is being added
      newLabel = { category: '', conf: 0, index: 0 }; // TODO: might need to actually create proper temp label w/ id here
    }
    else if (objectFocused && focusIndex.label) { // or obj & label are focused
      newLabel = object.labels[focusIndex.label];
    }
    setLabel(newLabel);
  }, [ object, focusIndex.label, objectFocused ]);

  // set label color and confidence - maybe this belongs in label component?
  const defaultColor = { primary: '$gray300', text: '$hiContrast' };
  const [ labelIndex, setLabelIndex ] = useState(0);
  const [ labelColor, setLabelColor ] = useState(defaultColor);
  const [ conf, setConf ] = useState(100);
  useEffect(() => {
    if (label) {
      // if obj is being added, it won't have a label yet, set labelIndex to 0
      let lblIdx = object.labels.indexOf(label);
      lblIdx = (lblIdx !== -1) ? lblIdx : 0;
      setLabelIndex(lblIdx);
      setLabelColor(labelColors(label.category));
      setConf(Number.parseFloat(label.conf * 100).toFixed(1));
    }
  }, [ label, object ]);

  // set index
  const [ index, setIndex ] = useState();
  useEffect(() => {
    setIndex({
      image: focusIndex.image,
      object: objectIndex,  // will be null if object.isBeingAdded
      label: labelIndex // will be 0 if object.isBeingAdded
    });
  }, [ focusIndex, objectIndex, labelIndex]);
  
  // track bbox
  const [ bbox, setBbox ] = useState(object.bbox);
  let { left, top, width, height } = relToAbs(bbox, imageWidth, imageHeight);
  useEffect(() => {
    setBbox(object.bbox);
  }, [ object ]);

  const onDrag = (event, { deltaX, deltaY }) => {
    const rect = { left: left + deltaX, top: top + deltaY, width, height };
    const newBbox = absToRel(rect, { imageWidth, imageHeight });
    setBbox(newBbox);
  };

  const [ lastBbox, setLastBbox ] = useState(object.bbox);
  const onDragStart = (event, data) => {
    setLastBbox(bbox);
  }
  
  const onDragEnd = () => {
    if (!_.isEqual(lastBbox, bbox)){ 
      dispatch(bboxUpdated({ imageId, objectId: object._id, bbox }));
    }
  };

  const [ constraintX, setConstraintX ] = useState(Infinity);
  const [ constraintY, setConstraintY ] = useState(Infinity);
  const onResize = (event, { size, handle }) => {
    // drags from left or top handles need require repositioning the box.
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
    const right = imageWidth - size.width - left;  
    const bottom = imageHeight - size.height - top;  
    if ((handle.indexOf('e') > -1) && (right <= 0)) setConstraintX(width);
    if ((handle.indexOf('w') > -1) && (left <= 0)) setConstraintX(width);
    if ((handle.indexOf('n') > -1) && (top <= 0)) setConstraintY(height);
    if ((handle.indexOf('s') > -1) && (bottom <= 0)) setConstraintY(height);

    const rect = { left, top, width: size.width, height: size.height };
    const newBbox = absToRel(rect, { imageWidth, imageHeight });
    setBbox(newBbox);
  };

  const onResizeStop = () => {
    setConstraintX(Infinity);
    setConstraintY(Infinity);
    dispatch(bboxUpdated({ imageId, objectId: object._id, bbox }));
  };

  const [ showLabelButtons, setShowLabelButtons ] = useState(false);
  const handleBBoxHover = () => setShowLabelButtons(true);
  const handleBBoxMouseLeave = () => setShowLabelButtons(false);
  const handleBBoxClick = () => dispatch(setFocus({ index, type: 'manual' }));

  return (
    <Draggable
      bounds='parent'
      handle='.drag-handle'
      // position={{ x: left + 1, y: top - 1 }}
      position={{ x: left, y: top }}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragEnd}
      disabled={object.locked}
    >
      <StyledResizableBox
        width={width}
        height={height}
        minConstraints={[0, 0]}
        maxConstraints={[constraintX, constraintY]}
        resizeHandles={['sw', 'se', 'nw', 'ne']}
        handle={(location) => (
          <ResizeHandle location={location} ref={(el) => {
            if (location === 'se') { handleRef.current = el }
          }}/>
        )}
        onResize={onResize}
        onResizeStop={onResizeStop}
        onClick={handleBBoxClick}
        onMouseOver={handleBBoxHover}
        onMouseEnter={handleBBoxHover}
        onMouseLeave={handleBBoxMouseLeave}
        selected={objectFocused}
        css={{ borderColor: labelColor.primary }}
      >
        {label &&
          <BoundingBoxLabel
            imageId={imageId}
            index={index}
            object={object}
            label={label}
            labelColor={labelColor}
            conf={conf}
            selected={objectFocused}
            showLabelButtons={showLabelButtons}
            setShowLabelButtons={setShowLabelButtons}
            setTempObject={setTempObject}
            verticalPos={(top > 30) ? 'top' : 'bottom'}
            horizontalPos={
              ((imageWidth - left - width) < 75) ? 'right' : 'left'
            }
          />
        }
        <DragHandle className='drag-handle'/>
      </StyledResizableBox>
    </Draggable>
  )
};

export default BoundingBox;