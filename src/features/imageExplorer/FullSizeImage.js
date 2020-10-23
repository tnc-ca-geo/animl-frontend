import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { selectScreenWidth } from '../ui/uiSlice';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  border: '2px solid tomato',
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
  const screenWidth = useSelector(selectScreenWidth);
  const containerEl = useRef(null);
  const [ imgLoaded, setImgLoaded ] = useState(false);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  useEffect(() => {
    const container = containerEl.current.getBoundingClientRect();
    if (width !== container.width) {
      setWidth(container.width)
    }
    if (height !== container.height) { 
      setHeight(container.height);
    }
  }, [ screenWidth, width, height, imgLoaded ]);

  const handleImgLoaded = () => setImgLoaded(true);

  return (
    <ImageWrapper ref={containerEl}>
      {testBBoxes.map((label, index) => (
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