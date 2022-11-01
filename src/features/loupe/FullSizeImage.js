import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useResizeObserver } from '../../app/utils';
import { styled } from '../../theme/stitches.config';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../../auth/roles';
import { drawBboxStart, selectIsDrawingBbox} from './loupeSlice';
import { selectWorkingImages, labelValidated, markedEmpty } from '../review/reviewSlice';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import DrawBboxOverlay from './DrawBboxOverlay';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIconLeft,
} from '../../components/contextMenu';
import { Pencil1Icon, ValueNoneIcon } from '@radix-ui/react-icons';
// import Button from '../../components/Button';

const EditObjectButton = styled('button', {
  border: 'none',
  borderRadius: '$0',
  fontFamily: 'roboto',
  backgroundColor: '$loContrast',
  color: '$hiContrast',
  height: '$6',
  fontWeight: '$3',
  fontSize: '$2',
  paddingLeft: '$4',
  paddingRight: '$4',
  textTransform: 'uppercase',
  transition: 'all 40ms linear',
  zIndex: '$3',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray4',
    cursor: 'pointer',
  },

  svg: {
    paddingRight: '$2'
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
  height: 'fit-content',
});

const ImageWrapper = styled('div', {
  position: 'relative',
  maxWidth: '940px',
});

const FullSizeImage = ({ image, focusIndex }) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const containerEl = useRef(null);
  const dims = useResizeObserver(containerEl);
  const dispatch = useDispatch();

  // track image loading state
  const [ imgLoaded, setImgLoaded ] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [ image._id ]);
  const handleImgLoaded = () => setImgLoaded(true);

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
    if (emptyLabels.length > 0) {
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
      dispatch(markedEmpty({ imgId: image._id, userId }));
    }
  };

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  return (
    <ImageWrapper ref={containerEl}>
      {isDrawingBbox &&
        <DrawBboxOverlay imageDimensions={dims} setTempObject={setTempObject} />
      }
      {imgLoaded && objectsToRender && objectsToRender.map((obj) => {
        return (
          <BoundingBox
            key={obj._id}
            imgId={image._id}
            imageWidth={dims.width}
            imageHeight={dims.height}
            object={obj}
            objectIndex={!obj.isTemp ? currImgObjects.indexOf(obj) : null}
            focusIndex={focusIndex}
            setTempObject={setTempObject}
          />
        );
      })}
      {/*{!imgLoaded &&
        <SpinnerOverlay css={{ background: 'none'}}>
          <CircleSpinner />
        </SpinnerOverlay>
      }*/}
      <ContextMenu>
        <ContextMenuTrigger>
          <FullImage src={image.url} onLoad={() => handleImgLoaded()} />
        </ContextMenuTrigger>
        <ContextMenuContent sideOffset={5} align="end">
          <ContextMenuItem
            onClick={handleAddObjectButtonClick}
          >
            <ContextMenuItemIconLeft>
              <Pencil1Icon />
            </ContextMenuItemIconLeft>
            Add object
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleMarkEmptyButtonClick}
          >
            <ContextMenuItemIconLeft>
              <ValueNoneIcon />
            </ContextMenuItemIconLeft>
            Mark empty
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {hasRole(userRoles, WRITE_OBJECTS_ROLES) &&
        <EditObjectButtons>
          <EditObjectButton
            onClick={handleMarkEmptyButtonClick}
          >
            <FontAwesomeIcon icon={['fas', 'times']} /> Mark empty
          </EditObjectButton>
          <EditObjectButton
            onClick={handleAddObjectButtonClick}
            css={{
              color: '$loContrast',
              backgroundColor: '$hiContrast',
            }}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} /> Add object
          </EditObjectButton>
        </EditObjectButtons>
      }
    </ImageWrapper>
  );
};

export default FullSizeImage;