import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGlobalEvent, useThrottledFn } from 'beautiful-react-hooks';
import { styled } from '../../theme/stitches.config';

import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import AddObjectOverlay from './AddObjectOverlay';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectIsAddingObject } from './loupeSlice';

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  // border: '2px solid tomato',
  position: 'relative',
});

const FullSizeImage = ({ image, loupeIndex }) => {
  const isAddingObject = useSelector(selectIsAddingObject);
  const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
  const [ imgLoaded, setImgLoaded ] = useState(false);
  const containerEl = useRef(null);
  const [ width, setWidth ] = useState();
  const [ height, setHeight ] = useState();
  const [ top, setTop ] = useState();
  const [ left, setLeft ] = useState();
  const onWindowResize = useGlobalEvent('resize');

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

  const [ filteredObjects, setFilteredObjects ] = useState(image.objects);
  useEffect(() => {
    const objectsToRender = image.objects.reduce((acc, object, i) => {
      const hasNonInvalidatedLabels = object.labels.some((label) => {
        return label.validation === null || label.validation.validated;
      });
      if (hasNonInvalidatedLabels || object.isBeingAdded) {
        acc.push(object);
      }
      return acc;
    }, []);
    setFilteredObjects(objectsToRender);
  }, [ image ]);

  const handleImgLoaded = () => setImgLoaded(true);

  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);

  return (
    <ImageWrapper ref={containerEl}>
      {isAddingObject &&
        <AddObjectOverlay
          dimensions={{ top, left, width, height }}
          loupeIndex={loupeIndex}
        />
      }
      {filteredObjects.map((object, i) => (
        <BoundingBox
          key={i}
          imageWidth={width}
          imageHeight={height}
          object={object}
          objectIndex={image.objects.indexOf(object)}
          loupeIndex={loupeIndex}
          objectSelected={i === loupeIndex.objects}
        />
      ))
      }
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