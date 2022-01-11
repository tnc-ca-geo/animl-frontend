import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useResizeObserver } from '../../app/utils';
import { styled } from '../../theme/stitches.config';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import DrawBboxOverlay from './DrawBboxOverlay';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { drawBboxStart, selectIsDrawingBbox} from './loupeSlice';
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
  bottom: -39,
  right: -1,
  display: 'flex',
  zIndex: '$3',
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
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const containerEl = useRef(null);
  const dims = useResizeObserver(containerEl);
  const dispatch = useDispatch();

  // track image loading state
  // NOTE: currently not using this. Consider removing
  const [ imgLoaded, setImgLoaded ] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);
  const handleImgLoaded = () => setImgLoaded(true);

  // get image's objects
  const workingImages = useSelector(selectWorkingImages);
  const [ currImgObjects, setCurrImgObjects ] = useState();
  useEffect(() => {
    if (focusIndex.image !== null) {
      setCurrImgObjects(workingImages[focusIndex.image].objects);
    }
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

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  const handleMarkEmptyButtonClick = () => {
    dispatch(markedEmpty({imageIndex: focusIndex.image}));
  };

  return (
    <ImageWrapper ref={containerEl}>
      {isDrawingBbox &&
        <DrawBboxOverlay
          imageDimensions={dims}
          focusIndex={focusIndex}
        />
      }
      {filteredObjects && filteredObjects.map((object, i) => (
        <BoundingBox
          key={object._id}
          imageWidth={dims.width}
          imageHeight={dims.height}
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