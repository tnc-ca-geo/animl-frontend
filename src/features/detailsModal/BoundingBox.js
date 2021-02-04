import React, { useState, useEffect } from 'react';
import { styled } from '../../theme/stitches.config';
import ResizableRect from 'react-resizable-rotatable-draggable';

// TODO: this doesn't work. Figure out how to style
const StyledResizableRect = styled(ResizableRect, {
  border: '$2 solid $blue400',
});

// convert [left, top, width, height] in absolute values to 
// [ymin, xmin, ymax, xmax] in relative values
const absToRel = (rect, image) => {
  const { left, top, width, height } = rect;
  const { imageWidth, imageHeight } = image;
  const ymin = Math.round(top) / imageHeight;
  const xmin = Math.round(left) / imageWidth;
  const ymax = Math.round(top) + Math.round(height) / imageHeight;
  const xmax = Math.round(left) + Math.round(width) / imageWidth;
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

const BoundingBox = ({ imageWidth, imageHeight, initialBbox }) => {

  // megadetector returns bboxes as 
  // [ymin, xmin, ymax, xmax] in relative values
  // so we are using that format in state. 
  const [ bbox, setBbox ] = useState(initialBbox);
  const { left, top, width, height } = relToAbs(bbox, imageWidth, imageHeight)

  useEffect(() => {
    console.log('creating new bbox: ', bbox);
  }, []);
  // TODO: prevent bbox from moving off image

  const handleResize = (style, isShiftKey, type) => {
    const rect = style;
    const image = { imageWidth, imageHeight };
    const newBbox = absToRel(rect, image);
    setBbox(newBbox);
  };

  const handleDrag = (deltaX, deltaY) => {
    console.log('dragging')
    console.log('deltax: ', deltaX)
    console.log('deltay: ', deltaY)

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

  const handleMoveEnd = () => {
    console.log('bounding box adjusted');
  };

  return (
    <StyledResizableRect
      left={left}
      top={top}
      width={width}
      height={height}
      zoomable='n, w, s, e, nw, ne, se, sw'
      rotatable={false}
      onResize={handleResize}
      onResizeEnd={handleMoveEnd}
      onDrag={handleDrag}
      onDragEnd={handleMoveEnd}
      // onResizeStart={this.handleResizeStart}
      // onDragStart={this.handleDragStart}
      // minWidth={10}
      // minHeight={10}
    />
  );

};

export default BoundingBox;