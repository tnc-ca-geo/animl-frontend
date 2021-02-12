import React, { useState, useRef, useEffect } from 'react';
import { useGlobalEvent, useThrottledFn } from 'beautiful-react-hooks';
import { styled } from '../../theme/stitches.config';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  // border: '2px solid tomato',
  position: 'relative',
});

const FullSizeImage = ({ image }) => {
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
    console.log('New image: ', image);
    setImgLoaded(false);
  }, [ image ]);

  useEffect(() => {
    console.log('imgLoaded: ', imgLoaded);
  }, [ imgLoaded ]);

  return (
    <ImageWrapper ref={containerEl}>
      {image.labels.map((label, index) => ( 
        <BoundingBox
          key={index}
          imageWidth={width}
          imageHeight={height}
          label={label}
        />
      ))}
      <FullImage src={image.url} onLoad={handleImgLoaded}/>
    </ImageWrapper>
  );
};

export default FullSizeImage;