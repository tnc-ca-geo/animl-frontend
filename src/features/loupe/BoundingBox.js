import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { styled, labelColors } from '../../theme/stitches.config';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { selectIndex, selectReviewMode } from './loupeSlice';
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
  ':hover': {
    cursor: 'grab',
  },
  ':user-select': {
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
      }
    }
  }
});

// convert [left, top, width, height] in absolute values to 
// [ymin, xmin, ymax, xmax] in relative values
const absToRel = (rect, image) => {
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

const BoundingBox = ({ imageWidth, imageHeight, object, selected }) => {
  // megadetector returns bboxes as 
  // [ymin, xmin, ymax, xmax] in relative values
  // so we are using that format in state.
  const [ bbox, setBbox ] = useState(object.bbox); // TODO: bump bbox state up to redux
  let { left, top, width, height } = relToAbs(bbox, imageWidth, imageHeight);
  const [ constraintX, setConstraintX ] = useState(Infinity);
  const [ constraintY, setConstraintY ] = useState(Infinity);

  const reviewMode = useSelector(selectReviewMode);
  const index = useSelector(selectIndex);
  const initialLabel = object.labels.find((label) => (
    label.validation === null || label.validation.validated
  ));
  const [ label, setLabel ] = useState(initialLabel);
  useEffect(() => {
    // if object is selected & we're in reviewMode,
    // show currently selected label,
    // else show top label (first non-invalidated in stack)
    const newLabel = selected && reviewMode
      ? object.labels[index.labels]
      : object.labels.find((label) => (
          label.validation === null || label.validation.validated 
        ));
    setLabel(newLabel);
  }, [ object, index, selected, reviewMode ]);

  const defaultColor = { primary: '$gray300', text: '$hiContrast' };
  const [ labelColor, setLabelColor ] = useState(defaultColor);
  const [ conf, setConf ] = useState(100);
  useEffect(() => {
    selected
      ? setLabelColor(labelColors(label.category))
      : setLabelColor(defaultColor);
    setConf(Number.parseFloat(label.conf * 100).toFixed(1));
  }, [ label, selected ]);  // weird behavior here if defaultColor is in dependency array
  
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
        console.log('right out of bounds')
        setConstraintX(width);
      }
    }
    if (handle.indexOf('w') > -1) {
      if (left <= 0) {
        console.log('left out of bounds')
        setConstraintX(width);
      }
    }
    if (handle.indexOf('n') > -1) {
      if (top <= 0) {
        console.log('top out of bounds');
        setConstraintY(height);
      }
    }
    if (handle.indexOf('s') > -1) {
      const bottom = imageHeight - size.height - top;  
      if (bottom <= 0) {
        console.log('bottom out of bounds');
        setConstraintY(height);
      }
    }
    
    width = size.width;
    height = size.height;
    const rect = {left, top, width, height};
    const image = { imageWidth, imageHeight };
    const newBbox = absToRel(rect, image);
    setBbox(newBbox);
  }

  const onResizeStop = () => {
    setConstraintX(Infinity);
    setConstraintY(Infinity);
  }

  return (
    <Draggable
      bounds='parent'
      handle='.drag-handle'
      position={{x: left, y: top}}
      onDrag={onDrag}
    >
      <StyledResizableBox
        width={width}
        height={height}
        maxConstraints={[constraintX, constraintY]}
        resizeHandles={['sw', 'se', 'nw', 'ne']}
        handle={(location) => <ResizeHandle location={location} />}
        onResize={onResize}
        onResizeStop={onResizeStop}
        selected={selected}
        css={{ borderColor: labelColor.primary }}
      >
        <BoundingBoxLabel
          verticalPos={(top > 30) ? 'top' : 'bottom'}
          horizontalPos={((imageWidth - left - width) < 75) ? 'right' : 'left' }
          index={index}
          label={label}
          labelColor={labelColor}
          conf={conf}
          selected={selected}
          // className='drag-handle'
        >
         {label.category} {conf}%
        </BoundingBoxLabel>
        <DragHandle className='drag-handle'/>
      </StyledResizableBox>
    </Draggable>
  )
};

export default BoundingBox;