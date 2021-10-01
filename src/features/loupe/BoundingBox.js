import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { styled, labelColors } from '../../theme/stitches.config';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { bboxUpdated, setFocus } from '../review/reviewSlice';
import BoundingBoxLabel from './BoundingBoxLabel';

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
  variants: {
    selected: {
      true: {
        zIndex: '$3',
        opacity: '1',
        // outline: 'none',
        // boxShadow: '0 0 0 3px $blue200',
        // borderColor: '$blue500',  
      },  
      false: {
        opacity: '0.75',
      },
    }
  }
});

/*
 * megadetector returns bboxes as [ymin, xmin, ymax, xmax] in relative values
 * so we are using that format in state
 */

// convert [left, top, width, height] in absolute values to 
// [ymin, xmin, ymax, xmax] in relative values
export const absToRel = (rect, image) => {
  const { left, top, width, height } = rect;
  const { imageWidth, imageHeight } = image;
  const ymin = Math.round(top) / imageHeight;
  const xmin = Math.round(left) / imageWidth;
  const ymax = (Math.round(top) + Math.round(height)) / imageHeight;
  const xmax = (Math.round(left) + Math.round(width)) / imageWidth;
  return [ymin, xmin, ymax, xmax];
};

// convert [ymin, xmin, ymax, xmax] in relative values to 
// [left, top, width, height] in absolute values
const relToAbs = (bbox, imageWidth, imageHeight) => {
  const left = bbox[1] * imageWidth;
  const top = bbox[0] * imageHeight;
  const width = (bbox[3] - bbox[1]) * imageWidth;
  const height = (bbox[2] - bbox[0]) * imageHeight;
  return { left, top, width, height };
};

const BoundingBox = (props) => {
  const { imageWidth, imageHeight, object, objectIndex, focusIndex } = props;
  const handleRef = useRef(null);
  const dispatch = useDispatch();

  // track whether the object is focused
  const [ objectFocused, setObjectFocused ] = useState();
  useEffect(() => {
    setObjectFocused((focusIndex.object === objectIndex));
  }, [ focusIndex.object, objectIndex ]);

  // set label
  const [ label, setLabel ] = useState();
  useEffect(() => {
    let newLabel;
    if (object.isBeingAdded) {
      // if the object is brand new, set temporary label
      newLabel = { category: '', conf: 0, index: 0 };
    }
    else if (objectFocused && focusIndex.label) {
      // else if object is focused, show currently focused label
      newLabel = object.labels[focusIndex.label];
    }
    else {
      // else show first non-invalidated label in array
      newLabel = object.labels.find((label) => (
        label.validation === null || label.validation.validated 
      ));
    }
    setLabel(newLabel);
  }, [ object, focusIndex.label, objectFocused ]);

  // set label color and confidence
  const defaultColor = { primary: '$gray300', text: '$hiContrast' };
  const [ labelIndex, setLabelIndex ] = useState(0);
  const [ labelColor, setLabelColor ] = useState(defaultColor);
  const [ conf, setConf ] = useState(100);
  useEffect(() => {
    if (label) {
      setLabelIndex(object.labels.indexOf(label))
      setLabelColor(labelColors(label.category));
      setConf(Number.parseFloat(label.conf * 100).toFixed(1));
    }
  }, [ label, object, objectFocused ]);  // weird behavior here if defaultColor is in dependency array
  
  // track bbox
  const [ bbox, setBbox ] = useState(object.bbox);
  let { left, top, width, height } = relToAbs(bbox, imageWidth, imageHeight);
  useEffect(() => {
    setBbox(object.bbox);
  }, [ object ]);

  const onDrag = (event, {deltaX, deltaY}) => {
    const rect = {
      left: left + deltaX,
      top: top + deltaY,
      width,
      height,
    };
    const image = { imageWidth, imageHeight };
    const newBbox = absToRel(rect, image);
    setBbox(newBbox);
  };

  const onDragEnd = () => {
    dispatch(bboxUpdated({
      imageIndex: focusIndex.image,
      objectIndex,
      bbox,
    }));
  }

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
    if (handle.indexOf('e') > -1) {
      const right = imageWidth - size.width - left;  
      if (right <= 0) {
        setConstraintX(width);
      }
    }
    if (handle.indexOf('w') > -1) {
      if (left <= 0) {
        setConstraintX(width);
      }
    }
    if (handle.indexOf('n') > -1) {
      if (top <= 0) {
        setConstraintY(height);
      }
    }
    if (handle.indexOf('s') > -1) {
      const bottom = imageHeight - size.height - top;  
      if (bottom <= 0) {
        setConstraintY(height);
      }
    }
    
    width = size.width;
    height = size.height;
    const rect = {left, top, width, height};
    const image = { imageWidth, imageHeight };
    const newBbox = absToRel(rect, image);
    setBbox(newBbox);
  };

  const onResizeStop = () => {
    setConstraintX(Infinity);
    setConstraintY(Infinity);
    dispatch(bboxUpdated({
      imageIndex: focusIndex.image,
      objectIndex,
      bbox,
    }));
  };

  const handleBBoxClick = () => {
    const newIndex = {
      image: focusIndex.image,
      object: objectIndex,
      label: labelIndex,
    };
    dispatch(setFocus({ index: newIndex, type: 'manual' }));
  }

  const [ showLabelButtons, setShowLabelButtons ] = useState(false);
  const handleBBoxHover = () => setShowLabelButtons(true);
  const handleBBoxMouseLeave = () => setShowLabelButtons(false);

  return (
    <Draggable
      bounds='parent'
      handle='.drag-handle'
      position={{x: left + 1, y: top - 1}}
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
            verticalPos={(top > 30) ? 'top' : 'bottom'}
            horizontalPos={((imageWidth - left - width) < 75) ? 'right' : 'left' }
            focusIndex={focusIndex}
            objectIndex={objectIndex}
            labelIndex={labelIndex}
            object={object}
            label={label}
            labelColor={labelColor}
            conf={conf}
            selected={objectFocused}
            showLabelButtons={showLabelButtons}
            setShowLabelButtons={setShowLabelButtons}
            // className='drag-handle'
          >
          {label.category} {conf}%
          </BoundingBoxLabel>
        }
        <DragHandle className='drag-handle'/>
      </StyledResizableBox>
    </Draggable>
  )
};

export default BoundingBox;