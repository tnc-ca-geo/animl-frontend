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

const testBBoxes = [
  {
    bbox: [
      0.3177,
      0.6124,
      0.1737,
      0.2574
    ]
  },
  {
    bbox: [
      0.4584,
      0.6838,
      0.1612,
      0.1831
    ]
  }
];

const FullSizeImage = ({ image }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerEl = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
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

  return (
    <ImageWrapper ref={containerEl}>
      {imgLoaded && testBBoxes.map((label, index) => (
        <BoundingBox
          key={index}
          imageWidth={width}
          imageHeight={height}
          initialBbox={label.bbox}
        />
      ))}
      <FullImage src={image.url} onLoad={handleImgLoaded}/>
    </ImageWrapper>
  );
};

export default FullSizeImage;