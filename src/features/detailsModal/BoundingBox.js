import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config';
import ResizableRect from 'react-resizable-rotatable-draggable';

// TODO: this doesn't work. Figure out how to style
const StyledResizableRect = styled(ResizableRect, {
  border: '$2 solid $blue400',
});

const absToNormalized = (rect, image) => {
  const { left, top, width, height } = rect;
  const { imageWidth, imageHeight } = image;
  return [
    (Math.round(left) / imageWidth),
    (Math.round(top) / imageHeight),
    (Math.round(width) / imageWidth),
    (Math.round(height) / imageHeight),
  ];
};

// where the bbox coordinates are [x, y, box_width, box_height]

const BoundingBox = ({ imageWidth, imageHeight, initialBbox }) => {
  // console.log('bbox: ', initialBbox);
  // console.log('image width: ', imageWidth);
  // console.log('image height: ', imageHeight);

  // TODO: store bbox in image entry in images slice
  const [ bbox, setBbox ] = useState(initialBbox);
  const left = bbox[0] * imageWidth;
  const top = bbox[1] * imageHeight;
  const width = bbox[2] * imageWidth;
  const height = bbox[3] * imageHeight;

  // TODO: prevent bbox from moving off image

  const handleResize = (style, isShiftKey, type) => {
    const rect = style;
    const image = { imageWidth, imageHeight };
    const newBbox = absToNormalized(rect, image);
    setBbox(newBbox);
  };

  const handleDrag = (deltaX, deltaY) => {
    const rect = {
      left: left + deltaX,
      top: top + deltaY,
      width,
      height,
    };
    const image = { imageWidth, imageHeight };
    const newBbox = absToNormalized(rect, image);
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