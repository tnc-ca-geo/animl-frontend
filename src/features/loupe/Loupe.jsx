import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions as undoActions } from 'redux-undo-redo';
import { styled } from '../../theme/stitches.config.js';
import {
  selectWorkingImages,
  selectFocusIndex,
  selectLastAction,
  selectLastCategoryApplied,
  labelsValidated,
  labelsAdded,
  markedEmpty,
  objectsManuallyUnlocked,
  incrementImage,
} from '../review/reviewSlice.js';
import { selectProjectTags } from '../projects/projectsSlice.js';
import { toggleOpenLoupe, drawBboxStart, drawBboxEnd, addLabelStart } from './loupeSlice.js';
import { selectUserUsername, selectUserCurrentRoles } from '../auth/authSlice';
import { hasRole, WRITE_OBJECTS_ROLES } from '../auth/roles.js';
import PanelHeader from '../../components/PanelHeader.jsx';
import FullSizeImage from './FullSizeImage.jsx';
import ImageReviewToolbar from './ImageReviewToolbar.jsx';
import ShareImageButton from './ShareImageButton';
import { ImageTagsToolbar } from './ImageTagsToolbar.jsx';
import { ImageMetadata } from './ImageMetadata.jsx';
import LoupeDropdown from './LoupeDropdown.jsx';
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastViewport,
} from '../../components/Toast.jsx';
import IconButton from '../../components/IconButton.jsx';
import { Cross2Icon } from '@radix-ui/react-icons';

const ImagePane = styled('div', {
  // display: 'flex',
  // justifyContent: 'center',
  // maxWidth: '900px',
  width: '100%',
  height: '100%',
});

const LoupeBody = styled('div', {
  // flexGrow: 1,
  // display: 'grid',
  // $7 - height of panel header
  // $8 - height of nav bar
  // 1px - border
  // 98px - height of toolbar plus height of 2 borders
  height: 'calc(100vh - $7 - $8 - 145px - 1px)',
  backgroundColor: '$backgroundBlack',
});

const LoupeHeader = styled(PanelHeader, {
  flexDirection: 'row-reverse',
  justifyContent: 'center',
});

const StyledLoupe = styled('div', {
  boxSizing: 'border-box',
  flexGrow: '1',
  position: 'relative',
  backgroundColor: '$backgroundLight',
  borderLeft: '1px solid $border',
  display: 'flex',
  flexDirection: 'column',
});

const ToolbarContainer = styled('div', {
  height: '145px',
});

const ShareImage = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '$2',
  bottom: '-40',
  left: '0',
  zIndex: '$3',
});

const Loupe = () => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const userId = useSelector(selectUserUsername);
  const workingImages = useSelector(selectWorkingImages);
  const focusIndex = useSelector(selectFocusIndex);
  const image = workingImages[focusIndex.image];
  const dispatch = useDispatch();
  const projectTags = useSelector(selectProjectTags);

  const validateLabels = (validated) => {
    const labelsToValidate = [];
    image.objects.forEach((object) => {
      if (object.locked) return;
      // find first non-invalidated label in array
      const label = object.labels.find(
        (lbl) => lbl.validation === null || lbl.validation.validated,
      );
      labelsToValidate.push({
        imgId: image._id,
        objId: object._id,
        lblId: label._id,
        userId,
        validated,
      });
    });
    dispatch(labelsValidated({ labels: labelsToValidate }));
  };

  const lastAction = useSelector(selectLastAction);
  const lastCategoryApplied = useSelector(selectLastCategoryApplied);
  const handleRepeatAction = () => {
    const actionMap = {
      'labels-validated': () => validateLabels(true),
      'labels-invalidated': () => validateLabels(false),
      'marked-empty': () => markEmpty(),
      'labels-added': () => {
        const newLabels = image.objects
          .filter((obj) => !obj.locked)
          .map((obj) => ({
            objIsTemp: obj.isTemp,
            userId,
            bbox: obj.bbox,
            labelId: lastCategoryApplied,
            objId: obj._id,
            imgId: image._id,
          }));
        dispatch(labelsAdded({ labels: newLabels }));
      },
    };
    if (lastAction in actionMap) {
      actionMap[lastAction]();
    }
  };

  const handleValidateAllButtonClick = (e, validated) => {
    e.stopPropagation();
    validateLabels(validated);
  };

  const markEmpty = () => {
    const labelsToValidate = [];
    image.objects.forEach((obj) => {
      obj.labels
        .filter((lbl) => lbl.labelId === 'empty' && !lbl.validated)
        .forEach((lbl) => {
          labelsToValidate.push({
            imgId: image._id,
            objId: obj._id,
            lblId: lbl._id,
            userId,
            validated: true,
          });
        });
    });
    if (labelsToValidate.length > 0) {
      dispatch(labelsValidated({ labels: labelsToValidate }));
    } else {
      dispatch(markedEmpty({ images: [{ imgId: image._id }], userId }));
    }
  };

  const handleAddObjectButtonClick = () => dispatch(drawBboxStart());

  const handleCloseLoupe = () => dispatch(toggleOpenLoupe(false));

  const handleUnlockAllButtonClick = () => {
    const objects = image.objects
      .filter(
        (obj) =>
          obj.locked &&
          obj.labels.some((lbl) => lbl.validation === null || lbl.validation.validated),
      )
      .map((obj) => ({ imgId: image._id, objId: obj._id }));
    dispatch(objectsManuallyUnlocked({ objects }));
  };

  const handleIncrementClick = (delta) => {
    dispatch(incrementImage(delta));
  };

  const [bboxesVisible, setBboxesVisible] = useState(true);
  useEffect(() => {
    setBboxesVisible(true);
  }, [image?._id]);
  const toggleBboxesVisible = useCallback(() => setBboxesVisible((v) => !v), []);

  // when bboxes are hidden, cancel any in-progress bbox drawing so the toolbar
  // doesn't get stuck showing the "esc to cancel" hint with no visible overlay
  useEffect(() => {
    if (!bboxesVisible) dispatch(drawBboxEnd());
  }, [bboxesVisible, dispatch]);

  // Track zoom state from FullSizeImage so the toolbar can disable
  // controls that aren't valid while zoomed (e.g. add-object).
  const fullSizeImageRef = useRef(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const handleZoomChange = useCallback((zoomed) => setIsZoomed(zoomed), []);
  useEffect(() => {
    setIsZoomed(false);
  }, [image?._id]);
  // exiting draw mode if user zooms in mid-draw
  useEffect(() => {
    if (isZoomed) dispatch(drawBboxEnd());
  }, [isZoomed, dispatch]);

  const [showHotkeyBlockedToast, setShowHotkeyBlockedToast] = useState(false);

  // Listen for hotkeys
  // TODO: should this all live in the ImageReviewToolbar?
  // TODO: use react synthetic onKeyDown events instead?
  const handleKeyDown = useCallback(
    (e) => {
      // ignore if keydown event is from focused input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || !image) {
        return;
      }
      let charCode = String.fromCharCode(e.which).toLowerCase();

      // arrows or WASD (increment/decrement)
      const delta =
        e.code === 'ArrowLeft' || charCode === 'a'
          ? 'decrement'
          : e.code === 'ArrowRight' || charCode === 'd'
            ? 'increment'
            : null;

      if (delta) {
        dispatch(incrementImage(delta));
        return;
      }

      // ctrl-z/shift-ctrl-z (undo/redo)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && charCode === 'z') {
        if (!bboxesVisible) {
          setShowHotkeyBlockedToast(true);
          return;
        }
        dispatch(undoActions.redo());
      } else if ((e.ctrlKey || e.metaKey) && charCode === 'z') {
        if (!bboxesVisible) {
          setShowHotkeyBlockedToast(true);
          return;
        }
        dispatch(undoActions.undo());
      }

      // ctrl-e (edit all)
      if ((e.ctrlKey || e.metaKey) && charCode === 'e' && hasRole(userRoles, WRITE_OBJECTS_ROLES)) {
        if (!bboxesVisible) {
          setShowHotkeyBlockedToast(true);
          return;
        }
        dispatch(addLabelStart('from-review-toolbar'));
      }

      // ctrl-v (repeat last action)
      if ((e.ctrlKey || e.metaKey) && charCode === 'v' && hasRole(userRoles, WRITE_OBJECTS_ROLES)) {
        e.stopPropagation();
        if (!bboxesVisible) {
          setShowHotkeyBlockedToast(true);
          return;
        }
        handleRepeatAction();
      }

      // zoom hotkeys: +/=/-/_/0
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '+' || e.key === '=') {
          fullSizeImageRef.current?.zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          fullSizeImageRef.current?.zoomOut();
        } else if (e.key === '0') {
          fullSizeImageRef.current?.resetZoom();
        }
      }

      // // handle ctrl-a (add object)
      // if ((e.ctrlKey || e.metaKey) && charCode === 'a') {
      //   e.stopPropagation();
      //   dispatch(drawBboxStart());
      // }
    },
    [dispatch, image, bboxesVisible, userRoles, handleRepeatAction],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <StyledLoupe>
      <LoupeHeader handlePanelClose={handleCloseLoupe} closeButtonPosition="left">
        {image && (
          <>
            <ImageMetadata image={image} />
            <LoupeDropdown image={image} />
          </>
        )}
      </LoupeHeader>
      <LoupeBody>
        {image && (
          <ImagePane>
            {/* <Image src={image.url} css={{ height: '100%', width: '100%', objectFit: 'contain' }} /> */}
            <FullSizeImage
              ref={fullSizeImageRef}
              workingImages={workingImages}
              image={image}
              focusIndex={focusIndex}
              bboxesVisible={bboxesVisible}
              handleMarkEmptyButtonClick={markEmpty}
              handleAddObjectButtonClick={handleAddObjectButtonClick}
              onZoomChange={handleZoomChange}
              css={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />
          </ImagePane>
        )}
      </LoupeBody>
      {/*<LoupeFooter image={image}/>*/}
      <ToolbarContainer>
        {image && hasRole(userRoles, WRITE_OBJECTS_ROLES) && (
          <>
            <ImageReviewToolbar
              image={image}
              lastAction={lastAction}
              handleRepeatAction={handleRepeatAction}
              handleValidateAllButtonClick={handleValidateAllButtonClick}
              handleMarkEmptyButtonClick={markEmpty}
              handleAddObjectButtonClick={handleAddObjectButtonClick}
              handleUnlockAllButtonClick={handleUnlockAllButtonClick}
              handleIncrementClick={handleIncrementClick}
              bboxesVisible={bboxesVisible}
              toggleBboxesVisible={toggleBboxesVisible}
              isZoomed={isZoomed}
            />
            <ImageTagsToolbar image={image} projectTags={projectTags} />
          </>
        )}
        <ShareImage>
          <ShareImageButton imageId={image?._id} />
        </ShareImage>
      </ToolbarContainer>
      {showHotkeyBlockedToast && (
        <>
          <Toast
            open={showHotkeyBlockedToast}
            duration={3000}
            onOpenChange={() => setShowHotkeyBlockedToast(false)}
          >
            <ToastTitle variant="red" css={{ marginBottom: 0 }}>
              Hotkeys disabled
            </ToastTitle>
            <ToastDescription asChild>
              <div>All bounding boxes must be visible to use keyboard shortcuts.</div>
            </ToastDescription>
            <ToastAction asChild altText="Dismiss">
              <IconButton variant="ghost">
                <Cross2Icon />
              </IconButton>
            </ToastAction>
          </Toast>
          <ToastViewport />
        </>
      )}
    </StyledLoupe>
  );
};

export default Loupe;
