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
import { selectObjects } from '../review/reviewSlice';
import Button from '../../components/Button';

const AddObjectButton = styled(Button, {
  position: 'absolute',
  bottom: 1,
  right: -1,
  border: 'none',
  borderRadius: '$0',
  // backgroundColor: '$loContrast',
  // color: '$hiContrast',
  zIndex: '$3',
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
  maxWidth: '940px',
});

const FullSizeImage = ({ image, focusIndex }) => {
  const isAddingObject = useSelector(selectIsAddingObject);
  const onWindowResize = useGlobalEvent('resize');
  const dispatch = useDispatch();

  // track image loading state
  const [ imgLoaded, setImgLoaded ] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);
  const handleImgLoaded = () => setImgLoaded(true);

  // track window width
  const [ windowWidth, setWindowWidth ] = useState(window.innerWidth);
  const onWindowResizeHandler = useThrottledFn(() => {
    setWindowWidth(window.innerWidth);
  }, 100);
  onWindowResize(onWindowResizeHandler);

  // track image position and dimensions
  const containerEl = useRef(null);
  const [ width, setWidth ] = useState();
  const [ height, setHeight ] = useState();
  const [ top, setTop ] = useState();
  const [ left, setLeft ] = useState();
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

  // get image's objects
  const allObjects = useSelector(selectObjects);
  const initObjects = allObjects[focusIndex.image];
  const [currImgObjects, setCurrImgObjects] = useState(initObjects);
  useEffect(() => {
    setCurrImgObjects(allObjects[focusIndex.image]);
  }, [ allObjects, focusIndex.image ]);

  // filter image's objects
  const [ filteredObjects, setFilteredObjects ] = useState(currImgObjects);
  useEffect(() => {
    if (currImgObjects) {
      const objectsToRender = currImgObjects.reduce((acc, object, i) => {
        const hasNonInvalidatedLabels = object.labels.some((label) => {
          return label.validation === null || label.validation.validated;
        });
        if (hasNonInvalidatedLabels || object.isBeingAdded) {
          acc.push(object);
        }
        return acc;
      }, []);
      setFilteredObjects(objectsToRender);
    }
  }, [ currImgObjects ]);

  const handleAddObjectButtonClick = () => dispatch(addObjectStart());

  return (
    <ImageWrapper ref={containerEl}>
      {isAddingObject &&
        <AddObjectOverlay
          imageDimensions={{ top, left, width, height }}
          focusIndex={focusIndex}
        />
      }
      {filteredObjects.map((object) => (
        <BoundingBox
          key={object._id}
          imageWidth={width}
          imageHeight={height}
          object={object}
          objectIndex={currImgObjects.indexOf(object)}
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