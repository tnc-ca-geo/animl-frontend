import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGlobalEvent, useThrottledFn } from 'beautiful-react-hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styled } from '../../theme/stitches.config';

import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import AddObjectOverlay from './AddObjectOverlay';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { addObjectStart, selectIsAddingObject} from './loupeSlice';
import Button from '../../components/Button';

const AddObjectButton = styled(Button, {
  position: 'absolute',
  bottom: 1,
  right: -1,
  border: 'none',
  borderRadius: '$0',
  ':hover': {
    color: '$hiContrast',
    backgroundColor: '$loContrast',
    cursor: 'pointer',
  },
});

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled.div({
  // border: '2px solid tomato',
  position: 'relative',
  maxWidth: '900px',
});

const FullSizeImage = ({ image, focusIndex }) => {
  const isAddingObject = useSelector(selectIsAddingObject);
  const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
  const [ imgLoaded, setImgLoaded ] = useState(false);
  const containerEl = useRef(null);
  const [ width, setWidth ] = useState();
  const [ height, setHeight ] = useState();
  const [ top, setTop ] = useState();
  const [ left, setLeft ] = useState();
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

  const [ filteredObjects, setFilteredObjects ] = useState(image.objects);
  useEffect(() => {
    console.log('image.objects has changed')
    const objectsToRender = image.objects.reduce((acc, object, i) => {
      const hasNonInvalidatedLabels = object.labels.some((label) => {
        return label.validation === null || label.validation.validated;
      });
      if (hasNonInvalidatedLabels || object.isBeingAdded) {
        acc.push(object);
      }
      return acc;
    }, []);
    console.log('setting filteredObjects: ', objectsToRender)
    setFilteredObjects(objectsToRender);
  }, [ image.objects ]);

  const handleImgLoaded = () => setImgLoaded(true);

  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);

  const handleAddObjectButtonClick = () => dispatch(addObjectStart());

  return (
    <ImageWrapper ref={containerEl}>
      {isAddingObject &&
        <AddObjectOverlay
          imageDimensions={{ top, left, width, height }}
          focusIndex={focusIndex}
        />
      }
      {filteredObjects.map((object, i) => (
        <BoundingBox
          key={object._id}
          imageWidth={width}
          imageHeight={height}
          object={object}
          objectIndex={image.objects.indexOf(object)}
          focusIndex={focusIndex}
        />
      ))
      }
      {/*{!imgLoaded &&
        <SpinnerOverlay css={{ background: 'none'}}>
          <CircleSpinner />
        </SpinnerOverlay>
      }*/}
      <FullImage src={image.url} onLoad={handleImgLoaded}/>
      <AddObjectButton
        onClick={handleAddObjectButtonClick}
        size='large'
      >
        <FontAwesomeIcon icon={['fas', 'plus']} />
        Add object
      </AddObjectButton>
    </ImageWrapper>
  );
};

export default FullSizeImage;