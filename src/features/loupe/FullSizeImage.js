import React, { useState, useRef, useEffect } from 'react';
import { useGlobalEvent, useThrottledFn } from 'beautiful-react-hooks';
import { styled } from '../../theme/stitches.config';

import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  // border: '2px solid tomato',
  position: 'relative',
});

const FullSizeImage = ({ image, loupeIndex }) => {
  const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
  const containerEl = useRef(null);
  const [ imgLoaded, setImgLoaded ] = useState(false);
  const [ width, setWidth ] = useState();
  const [ height, setHeight ] = useState();
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
  }, [ windowWidth, width, height, imgLoaded ]);

  const handleImgLoaded = () => setImgLoaded(true);

  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);

  // Testing
  useEffect(() => {
    console.log('new index: ', loupeIndex);
  }, [loupeIndex])

  return (
    <ImageWrapper ref={containerEl}>
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