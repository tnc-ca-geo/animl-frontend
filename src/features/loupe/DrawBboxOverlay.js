import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ObjectID } from 'bson';
import { styled } from '../../theme/stitches.config';
import { absToRel } from '../../app/utils';
import { setFocus } from '../review/reviewSlice';
import { drawBboxEnd, addLabelStart } from './loupeSlice';


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
  border: '2px solid #00C797'
});

const Overlay = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  zIndex: '$4',
});

const DrawBboxOverlay = ({ imageDimensions, setTempObject }) => {
  const { width, height, top, left } = imageDimensions;
  const [ mousePos, setMousePos ] = useState({ x: 0, y: 0 });
  const [ drawingBBox, setDrawingBBox ] = useState(false);
  const defaultBBox = { top: 0, left: 0, width: 0, height: 0 };
  const [ tempBBox, setTempBBox ] = useState(defaultBBox);
  const dispatch = useDispatch();

  const handlePointerMove = (e) => {

    let containerX = e.clientX - left;
    containerX = (e.clientX >= (left + width)) ? width : containerX;
    containerX = (e.clientX <= left) ? left : containerX;

    let containerY = e.clientY - top;
    containerY = (e.clientY >= (top + height)) ? height : containerY;
    containerY = (e.clientY <= top) ? top : containerY;

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
    const newTop = mousePos.y - 2;  // subtracting 2px for border
    const newLeft = mousePos.x - 2;
    setTempBBox({...tempBBox, ...{ top: newTop, left: newLeft }})
    setDrawingBBox(true);
  };

  const handleMouseUp = () => {
    // create bbox
    const imageDims = { imageWidth: width, imageHeight: height };
    const bbox = absToRel(tempBBox, imageDims);
    const newObject = {
      _id: new ObjectID().toString(),
      isTemp: true,
      bbox: bbox,
      locked: false,
      labels: [],
    };
    setTempObject(newObject);
    setDrawingBBox(false);
    setTempBBox(defaultBBox);
    dispatch(setFocus({ index: { object: null }, type: 'auto' }));
    dispatch(drawBboxEnd());
    dispatch(addLabelStart())
  };

  // listen for esc keydown and end drawBbox
  // TODO: should be able to use react synthetic onKeyDown events,
  // but couldn't get it working
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") dispatch(drawBboxEnd());
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ dispatch ]);


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

export default DrawBboxOverlay;