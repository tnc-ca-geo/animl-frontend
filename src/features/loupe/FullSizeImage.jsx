import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useResizeObserver } from '../../app/utils';
import { styled } from '../../theme/stitches.config';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_OBJECTS_ROLES, WRITE_IMAGES_ROLES } from '../../auth/roles';
import { drawBboxStart, selectIsDrawingBbox} from './loupeSlice';
import { selectWorkingImages, labelsValidated, markedEmpty, deleteImages } from '../review/reviewSlice';
import { Image } from '../../components/Image';
import BoundingBox from './BoundingBox';
import DrawBboxOverlay from './DrawBboxOverlay';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIconLeft,
} from '../../components/ContextMenu';
import ShareImageButton from './ShareImageButton';
import { Pencil1Icon, ValueNoneIcon } from '@radix-ui/react-icons';

const EditObjectButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
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
    marginRight: '$2'
  },
});

const ShareImage = styled('div', {
  position: 'absolute',
  display: 'flex',
  height: '40px',
  bottom: '-40',
  left: '0',
  zIndex: '$3',
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
      const labelsToValidate = [];
      currImgObjects.forEach((obj) => {
        obj.labels
          .filter((lbl) => lbl.category === 'empty' && !lbl.validated)
          .forEach((lbl) => {
            labelsToValidate.push({
              imgId: image._id,
              objId: obj._id,
              lblId: lbl._id,
              userId,
              validated: true
            });
        });
      });
      dispatch(labelsValidated({ labels: labelsToValidate }))
    }
    else {
      dispatch(markedEmpty({ images: [{ imgId: image._id }], userId }));
    }
  };

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  const handleDeleteButtonClick = () => dispatch(deleteImages([image._id]));

  return (
    <ImageWrapper ref={containerEl} className='full-size-image'>
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
        <ContextMenuTrigger 
          disabled={!hasRole(userRoles, WRITE_OBJECTS_ROLES)}
        >
          <FullImage src={image.url} onLoad={() => handleImgLoaded()} />
        </ContextMenuTrigger>
        <ContextMenuContent sideOffset={5} align="end">
          <ContextMenuItem
            onSelect={handleAddObjectButtonClick}
          >
            <ContextMenuItemIconLeft>
              <Pencil1Icon />
            </ContextMenuItemIconLeft>
            Add object
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={handleMarkEmptyButtonClick}
          >
            <ContextMenuItemIconLeft>
              <ValueNoneIcon />
            </ContextMenuItemIconLeft>
            Mark empty
          </ContextMenuItem>
          {hasRole(userRoles, WRITE_IMAGES_ROLES) &&
            <ContextMenuItem
              onSelect={handleDeleteButtonClick}
            >
              <ContextMenuItemIconLeft>
                <TrashIcon />
              </ContextMenuItemIconLeft>
              Delete
            </ContextMenuItem>
          }
        </ContextMenuContent>
      </ContextMenu>
      <ShareImage>
        <ShareImageButton imageId={image._id}/>
      </ShareImage>
      {hasRole(userRoles, WRITE_OBJECTS_ROLES) &&
        <EditObjectButtons>
          <EditObjectButton onClick={handleDeleteButtonClick}>
            <TrashIcon /> Delete
          </EditObjectButton>
          <EditObjectButton onClick={handleMarkEmptyButtonClick}>
            <Cross2Icon /> Mark empty
          </EditObjectButton>
          <EditObjectButton
            onClick={handleAddObjectButtonClick}
            css={{
              color: '$loContrast',
              backgroundColor: '$hiContrast',
            }}
          >
            <PlusIcon /> Add object
          </EditObjectButton>
        </EditObjectButtons>
      }
    </ImageWrapper>
  );
};

export default FullSizeImage;
