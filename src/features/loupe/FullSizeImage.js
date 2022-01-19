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
import { selectWorkingImages, labelValidated, markedEmpty } from '../review/reviewSlice';
import { selectUserUsername } from '../user/userSlice';
import Button from '../../components/Button';

const MarkEmptyButton = styled(Button, {
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
  border: 'none',
  borderRadius: '$0',
  zIndex: '$3',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray400',
    cursor: 'pointer',
  },
});

const EditObjectButtons = styled('div', {
  position: 'absolute',
  bottom: '-40',
  right: '0',
  display: 'flex',
  zIndex: '$3',
});

const FullImage = styled(Image, {
  maxWidth: '100%',
  height: 'auto',
});

const ImageWrapper = styled('div', {
  position: 'relative',
  maxWidth: '940px',
});

const FullSizeImage = ({ image, focusIndex }) => {
  const userId = useSelector(selectUserUsername);
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const containerEl = useRef(null);
  const dims = useResizeObserver(containerEl);
  const dispatch = useDispatch();

  /*
  // track image loading state
  // NOTE: currently not using this. Consider removing
  const [ imgLoaded, setImgLoaded ] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [ image ]);
  const handleImgLoaded = () => setImgLoaded(true);
  */

  // get image's objects
  const workingImages = useSelector(selectWorkingImages);
  const [ currImgObjects, setCurrImgObjects ] = useState();
  useEffect(() => {
    if (focusIndex.image === null) return;
    const objects = workingImages[focusIndex.image].objects;
    setCurrImgObjects(objects);    
  }, [ workingImages, focusIndex.image ]);

  // prep objects to render
  const [ objectsToRender, setObjectsToRender ] = useState();
  const [ tempObject, setTempObject ] = useState(null);
  useEffect(() => {
    let objects = [];
    if (!currImgObjects) return;
    const filteredObjects = currImgObjects.filter((obj) => (
      obj.labels.some((lbl) => (
        lbl.validation === null || lbl.validation.validated
      ))
    ));
    objects = objects.concat(filteredObjects);
  
    if (tempObject) objects.push(tempObject);
    // I think we also need to set focus to this object, but it doesn't yet exist...
    // will that cause issues?
    // and we need to dispatch addLabelStart(); so loupeSlice.isAddingLabel === true
    setObjectsToRender(objects);
  }, [ currImgObjects, tempObject ]);

  const [ hasEmpties, setHasEmpties ] = useState(false);
  useEffect(() => {
    if (!currImgObjects) return;
    const emptyLbls = currImgObjects.reduce((acc, curr) => {
      return acc.concat(curr.labels.filter((lbl) => (
        lbl.category === 'empty' && !lbl.validated
      )));
    }, []);
    setHasEmpties(emptyLbls.length > 0);
  }, [ currImgObjects ]);

  const handleMarkEmptyButtonClick = () => {
    if (hasEmpties) {
      console.log('image already has empty labels, so validating them');
      currImgObjects.forEach((obj) => {
        obj.labels.filter((lbl) => (
          lbl.category === 'empty' && !lbl.validated
        )).forEach((lbl) => {
          dispatch(labelValidated({
            imageId: image._id,
            objectId: obj._id,
            labelId: lbl._id,
            userId,
            validated: true
          }));
        });
      });
    } else {
      dispatch(markedEmpty({ imageId: image._id, userId }));
    }

  };

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());


  return (
    <ImageWrapper ref={containerEl}>
      {isDrawingBbox &&
        <DrawBboxOverlay
          imageId={image._id}
          imageDimensions={dims}
          setTempObject={setTempObject}
        />
      }
      {objectsToRender && objectsToRender.map((object, i) => (
        <BoundingBox
          key={object._id}
          imageId={image._id}
          imageWidth={dims.width}
          imageHeight={dims.height}
          object={object}
          objectIndex={!object.isBeingAdded 
            ? currImgObjects.indexOf(object) 
            : null
          }
          focusIndex={focusIndex}
          setTempObject={setTempObject}
        />
      ))}
      {/*{!imgLoaded &&
        <SpinnerOverlay css={{ background: 'none'}}>
          <CircleSpinner />
        </SpinnerOverlay>
      }*/}
      <FullImage src={image.url} /*onLoad={handleImgLoaded}*//>
      <EditObjectButtons>
        <MarkEmptyButton onClick={handleMarkEmptyButtonClick} size='large' >
          <FontAwesomeIcon icon={['fas', 'times']} /> Mark empty
        </MarkEmptyButton>
        <AddObjectButton onClick={handleAddObjectButtonClick} size='large' >
          <FontAwesomeIcon icon={['fas', 'plus']} /> Add object
        </AddObjectButton>
      </EditObjectButtons>
    </ImageWrapper>
  );
};

export default FullSizeImage;