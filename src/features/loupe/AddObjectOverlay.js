import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config';

import { absToRel } from './BoundingBox';
import { objectAdded } from '../images/imagesSlice';


const CrossHairHorizontal = styled('div', {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '1px',
  borderTop: '1px dashed $loContrast',
});

const CrossHairVertical = styled('div', {
  position: 'absolute',
  top: '0',
  left: '0',
  height: '100%',
  width: '1px',
  borderLeft: '1px dashed $loContrast',
});

const TempBoundingBox = styled('div', {
  position: 'absolute',
  boxSizing: 'border-box',
  border: '3px solid papayawhip'
});

const Overlay = styled.div({
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '$4',
});

const AddObjectOverlay = ({ dimensions, loupeIndex }) => {
  const { top, left, width, height } = dimensions;
  const [ mousePos, setMousePos ] = useState({ x: 0, y: 0 });
  const [ drawingBBox, setDrawingBBox ] = useState(false);
  const defaultBBox = { top: 0, left: 0, width: 0, height: 0 };
  const [ tempBBox, setTempBBox ] = useState(defaultBBox);
  const dispatch = useDispatch();

  const handlePointerMove = (event) => {
    const containerX = ('clientX' in event ? event.clientX : 0) - left;
    const containerY = ('clientY' in event ? event.clientY : 0) - top;
    // TODO: figure out why the crosshair rendering is so laggy
    setMousePos({ x: containerX, y: containerY });
    if (drawingBBox) {
      // update tempBoxWidth and tempBoxHeight
      const newWidth = containerX - tempBBox.left;
      const newHeight = containerY - tempBBox.top;
      setTempBBox({...tempBBox, ...{ width: newWidth, height: newHeight }})
      // TODO: if width/height are negative, 
      // use absolute values, and update the top/left accordingly 
      // (so you can click and drag to the south west and it will still work)
    }
  };

  const handleMouseDown = (e) => {
    const newTop = mousePos.y - 3;
    const newLeft = mousePos.x - 3;
    setTempBBox({...tempBBox, ...{ top: newTop, left: newLeft }})
    setDrawingBBox(true);
  }

  const handleMouseUp = () => {
    // create object  
    // TODO: move this all to middleware?
    // TODO: double check that width & height are same as actual image width/height
    const image = { imageWidth: width, imageHeight: height };
    const bbox = absToRel(tempBBox, image);
    const payload = {
      loupeIndex: loupeIndex,
      bbox: bbox,
    }
    dispatch(objectAdded(payload));
    setDrawingBBox(false);
    setTempBBox(defaultBBox);
  }

  return (
    <Overlay
      onPointerMove={handlePointerMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}

    >
      <CrossHairHorizontal
        style={{ transform: `translateY(${mousePos.y}px)` }}
      />
      <CrossHairVertical
        style={{ transform: `translateX(${mousePos.x}px)` }}
      />
      {drawingBBox && 
        <TempBoundingBox
          css={{
            transform: `translate(${tempBBox.left}px, ${tempBBox.top}px)`,
            width: tempBBox.width,
            height: tempBBox.height,
          }}
        />
      }
    </Overlay>
  );
};

export default AddObjectOverlay;