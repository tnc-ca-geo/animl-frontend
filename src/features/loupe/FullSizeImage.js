import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGlobalEvent, useThrottledFn } from 'beautiful-react-hooks';
import { styled } from '../../theme/stitches.config';

import { Image } from '../../components/Image';
import BoundingBox, { absToRel } from './BoundingBox';
import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { isAddingObject, isResizingObject, selectIsAddingObject } from './loupeSlice';
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

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  // border: '2px solid tomato',
  position: 'relative',
});

const FullSizeImage = ({ image, loupeIndex }) => {
  const addingObject = useSelector(selectIsAddingObject);
  const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
  const [ imgLoaded, setImgLoaded ] = useState(false);
  const containerEl = useRef(null);
  const [ width, setWidth ] = useState();
  const [ height, setHeight ] = useState();
  const [ top, setTop ] = useState();
  const [ left, setLeft ] = useState();
  const [ mousePos, setMousePos ] = useState({x: 0, y: 0});
  const onWindowResize = useGlobalEvent('resize');
  const dispatch = useDispatch();

  const onWindowResizeHandler = useThrottledFn(() => {
    setWindowWidth(window.innerWidth);
  }, 100);
  onWindowResize(onWindowResizeHandler);

  useEffect(() => {
    const container = containerEl.current.getBoundingClientRect();
    if (width !== container.width) {
      setWidth(container.width)
    }
    if (height !== container.height) { 
      setHeight(container.height);
    }
    if (top !== container.top) {
      setTop(container.top);
    }
    if (left !== container.left) {
      setLeft(container.left);
    }
  }, [ windowWidth, width, height, top, left, imgLoaded ]);

  const handleImgLoaded = () => setImgLoaded(true);

  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);
  
  const handlePointerMove = useCallback((event) => {
    if (addingObject) {
      const containerX = ('clientX' in event ? event.clientX : 0) - left;
      const containerY = ('clientY' in event ? event.clientY : 0) - top;
      // TODO: figure out why the crosshair rendering is so laggy
      setMousePos({ x: containerX, y: containerY });
    }
  }, [ addingObject, top, left, setMousePos ]);

  const handleImageMouseDown = () => {
    console.log('handling mouse down on image. addingObject: ', addingObject)
    if (addingObject) {
      // TODO: move this all to middleware?
      const rect = { left: mousePos.x, top: mousePos.y, width: 5, height: 5 };
      const image = { imageWidth: width, imageHeight: height }; // TODO: double check that width & height are same as actual image width/height
      const payload = {
        loupeIndex: loupeIndex,
        bbox: absToRel(rect, image),
      }
      dispatch(objectAdded(payload));
      dispatch(isAddingObject(false));
      dispatch(isResizingObject(true));
    }
  }

  return (
    <ImageWrapper
      ref={containerEl}
      onPointerMove={handlePointerMove}
      onMouseDown={handleImageMouseDown}
    >
      {addingObject &&
        <>
          <CrossHairHorizontal
            css={{ transform: `translateY(${mousePos.y}px)` }}
          />
          <CrossHairVertical
            css={{ transform: `translateX(${mousePos.x}px)` }}
          />
        </>
      }
      {image.objects.map((object, index) => (
        <BoundingBox
          key={index}
          imageWidth={width}
          imageHeight={height}
          object={object}
          loupeIndex={loupeIndex}
          selected={index === loupeIndex.objects}
        />
      ))}
      {/*{!imgLoaded &&
        <SpinnerOverlay css={{ background: 'none'}}>
          <CircleSpinner />
        </SpinnerOverlay>
      }*/}
      <FullImage src={image.url} onLoad={handleImgLoaded}/>
    </ImageWrapper>
  );
};

export default FullSizeImage;