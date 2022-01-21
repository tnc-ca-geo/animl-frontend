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

  const workingImages = useSelector(selectWorkingImages);
  const currImgObjects = workingImages[focusIndex.image].objects;
  const [ tempObject, setTempObject ] = useState(null);
  let objectsToRender = currImgObjects.filter((obj) => (
    obj.labels.some((lbl) => (
      lbl.validation === null || lbl.validation.validated
    ))
  ));
  if (tempObject) objectsToRender.push(tempObject);

  // if obejctsToRender contains any empties, order them first
  // so that they get rendered below the smaller bboxes, 
  // making them easier to select
  const emptyObjIndices = objectsToRender.reduce((acc, curr, i) => {
    if (curr.labels.some((lbl) => lbl.category === 'empty')) acc.push(i);
    return acc;
  }, []);
  emptyObjIndices.forEach((i) => {
    const object = objectsToRender[i];
    objectsToRender.splice(i, 1);
    objectsToRender.unshift(object);
  });

  // track whether the image has objects with empty, unvalidated labels
  const emptyLabels = currImgObjects.reduce((acc, curr) => {
    return acc.concat(curr.labels.filter((lbl) => (
      lbl.category === 'empty' && !lbl.validated
    )));
  }, []);

  const handleMarkEmptyButtonClick = () => {
    console.log('FullSizeImage - Mark empty button clicked');
    if (emptyLabels.length > 0) {
      console.log('NOTE: found objects with empty, unvalidated labels, so validating them');
      currImgObjects.forEach((obj) => {
        obj.labels
          .filter((lbl) => (lbl.category === 'empty' && !lbl.validated))
          .forEach((lbl) => {
            dispatch(labelValidated({
              imgId: image._id,
              objId: obj._id,
              lblId: lbl._id,
              userId,
              validated: true
            }));
        });
      });
    }
    else {
      console.log('NOTE: NO objects found with empty, unvalidated labels, so creating empty obj');
      dispatch(markedEmpty({ imgId: image._id, userId }));
    }
  };

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  return (
    <ImageWrapper ref={containerEl}>
      {isDrawingBbox &&
        <DrawBboxOverlay imageDimensions={dims} setTempObject={setTempObject} />
      }
      {objectsToRender && objectsToRender.map((object, i) => (
        <BoundingBox
          key={object._id}
          imgId={image._id}
          imageWidth={dims.width}
          imageHeight={dims.height}
          object={object}
          objectIndex={!object.isTemp ? currImgObjects.indexOf(object) : null}
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