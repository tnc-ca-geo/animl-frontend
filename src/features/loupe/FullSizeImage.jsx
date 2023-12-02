import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useResizeObserver } from '../../app/utils';
import { styled } from '../../theme/stitches.config';
// import { CircleSpinner, SpinnerOverlay } from '../../components/Spinner';
import { selectUserUsername, selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../../auth/roles';
import { selectIsDrawingBbox} from './loupeSlice';
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
import { Pencil1Icon, ValueNoneIcon } from '@radix-ui/react-icons';
import { contain } from 'intrinsic-scale';

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
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const ImageContainer = styled('div', {
  position: 'relative',
  // maxWidth: '940px',
  width: '100%',
  height: '100%',
});

const ImageFrame = styled('div', {
  position: 'absolute'
});

const FullSizeImage = ({ workingImages, image, focusIndex, handleAddObjectButtonClick, handleMarkEmptyButtonClick }) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const isDrawingBbox = useSelector(selectIsDrawingBbox);
  const dispatch = useDispatch();

  // track image loading state
  const [ imgLoaded, setImgLoaded ] = useState(false);
  useEffect(() => {
    setImgLoaded(false);
  }, [ image._id ]);
  const handleImgLoaded = () => setImgLoaded(true);
  
  // track actual, rendered image dimensions. This is necessary because we're
  // using the `object-fit: contain` css property on the <img/> tag itself
  // to handle both horizontal and vertical auto-resizing, and use-resize-observer
  // tracks the image's parent container's dims rather than the resized image's
  // https://github.com/ZeeCoder/use-resize-observer/issues/106
  const imgEl = useRef(null);
  const imgContainerDims = useResizeObserver(imgEl);
  const [ imgDims, setImgDims ] = useState({ width: 0, height: 0, x: 0, y: 0 });
  useEffect(() => {
    if (imgLoaded) {
      const src = { width: imgEl.current.naturalWidth, height: imgEl.current.naturalHeight };
      const dest = { width: imgContainerDims.width, height: imgContainerDims.height };
      let containedImgDims = contain(dest.width, dest.height, src.width, src.height);
      setImgDims(containedImgDims);
    }
  }, [ imgLoaded, imgContainerDims.width, imgContainerDims.height ]);

  // build array of objects to render
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

  return (
    <ImageContainer className='image-container'>
      {imgLoaded &&
        <ImageFrame
          className='image-frame'
          css={{
            left: imgDims.x,
            top: imgDims.y,
            width: imgDims.width,
            height: imgDims.height
          }}
        >
          {objectsToRender && objectsToRender.map((obj) => {
            return (
              <BoundingBox
                key={obj._id}
                imgId={image._id}
                imgDims={imgDims}
                object={obj}
                objectIndex={!obj.isTemp ? currImgObjects.indexOf(obj) : null}
                focusIndex={focusIndex}
                setTempObject={setTempObject}
              />
            );
          })}
          {isDrawingBbox &&
            <DrawBboxOverlay
              imgContainerDims={imgContainerDims}
              imgDims={imgDims}
              setTempObject={setTempObject}
            />
          }
          {/*{!imgLoaded &&
            <SpinnerOverlay css={{ background: 'none'}}>
              <CircleSpinner />
            </SpinnerOverlay>
          }*/}
        </ImageFrame>
      }
      <ContextMenu>
        <ContextMenuTrigger 
          disabled={!hasRole(userRoles, WRITE_OBJECTS_ROLES)}
        >
          <FullImage ref={imgEl} src={image.url} onLoad={() => handleImgLoaded()} />
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
        </ContextMenuContent>
      </ContextMenu>
    </ImageContainer>
  );
};

export default FullSizeImage;