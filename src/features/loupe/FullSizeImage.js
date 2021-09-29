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
import { selectWorkingImages, markedEmpty } from '../review/reviewSlice';
import Button from '../../components/Button';

const MarkEmptyButton = styled(Button, {
  // position: 'absolute',
  // bottom: 1,
  // right: -75,
  border: 'none',
  borderRadius: '$0',
  backgroundColor: '$loContrast',
  color: '$hiContrast',
  zIndex: '$3',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray400',
    cursor: 'pointer',
  },
});

const AddObjectButton = styled(Button, {
  // position: 'absolute',
  // bottom: 1,
  // right: -1,
  border: 'none',
  borderRadius: '$0',
  // backgroundColor: '$loContrast',
  // color: '$hiContrast',
  zIndex: '$3',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray400',
    cursor: 'pointer',
  },
});

const EditObjectButtons = styled('div', {
  position: 'absolute',
  bottom: 1,
  right: -1,
  display: 'flex',
});

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled('div', {
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
  const workingImages = useSelector(selectWorkingImages);
  const [ currImgObjects, setCurrImgObjects ] = useState();
  useEffect(() => {
    setCurrImgObjects(workingImages[focusIndex.image].objects);
  }, [ workingImages, focusIndex.image ]);

  // filter image's objects
  const [ filteredObjects, setFilteredObjects ] = useState();
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

  const handleMarkEmptyButtonClick = () => {
    dispatch(markedEmpty({imageIndex: focusIndex.image}));
  };

  return (
    <ImageWrapper ref={containerEl}>
      {isAddingObject &&
        <AddObjectOverlay
          imageDimensions={{ top, left, width, height }}
          focusIndex={focusIndex}
        />
      }
      {filteredObjects && filteredObjects.map((object, i) => (
        <BoundingBox
          key={object._id}
          imageWidth={width}
          imageHeight={height}
          object={object}
          objectIndex={currImgObjects.indexOf(object)}
          focusIndex={focusIndex}
        />
      ))}
      {/*{!imgLoaded &&
        <SpinnerOverlay css={{ background: 'none'}}>
          <CircleSpinner />
        </SpinnerOverlay>
      }*/}
      <FullImage src={image.url} onLoad={handleImgLoaded}/>
      <EditObjectButtons>
        <MarkEmptyButton
          onClick={handleMarkEmptyButtonClick}
          size='large'
        >
            <FontAwesomeIcon icon={['fas', 'times']} />
            Mark empty
        </MarkEmptyButton>
        <AddObjectButton
          onClick={handleAddObjectButtonClick}
          size='large'
        >
          <FontAwesomeIcon icon={['fas', 'plus']} />
          Add object
        </AddObjectButton>
      </EditObjectButtons>
    </ImageWrapper>
  );
};

export default FullSizeImage;