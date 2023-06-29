import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { actions as undoActions } from 'redux-undo-redo';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import IconButton from '../../components/IconButton.jsx';
import { selectImagesCount } from '../images/imagesSlice.js';
import { selectModalOpen } from '../projects/projectsSlice.js';
import { selectIsAddingLabel, selectReviewMode } from './loupeSlice.js';
import {
  incrementFocusIndex,
  incrementImage,
  selectFocusIndex,
} from '../review/reviewSlice.js';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

const IndexDisplay = styled('div', {
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '$1',
  marginLeft: '$3',
  display: 'flex',
  justifyContent: 'right',
  alignItems: 'center',
  flexGrow: '0',
  flexShrink: '0',
});

const Index = styled('span', {
  color: '$textDark',
  marginRight: '$3',
})

const IndexUnit = styled('span', {
  color: '$gray6',
  fontSize: '$2',
});

const ProgressBar = styled('div', {
  height: '$1',
  width: '100%',
  backgroundColor: '$gray3',
  position: 'relative',
  borderRadius: '$2',
});

const ProgressIndicator = styled('span', {
  backgroundColor: '$blue600',
  height: '$1',
  position: 'absolute',
  display: 'block',
  borderRadius: '$2',
});

const ProgressDisplay = styled('div', {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '$0 $2 $0 $3',
});

const IncrementControls = styled('div', {
  display: 'flex',
  padding: '$0 $2 $0 $1',
});

const StyledLoupeFooter = styled('div', {
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: '$7',
  borderTop: '1px solid $border',
  fontWeight: '$5',
  color: '$textDark',
});

const LoupeFooter = ({ image }) => {
  const dispatch = useDispatch();

  // track progress
  const imageCount = useSelector(selectImagesCount);
  const focusIndex = useSelector(selectFocusIndex);
  const initProgress = (focusIndex.image / imageCount) * 100
  const [ progress, setProgress ] = useState(initProgress);
  useEffect(() => {
    setProgress((focusIndex.image / imageCount) * 100);
  }, [ focusIndex.image, imageCount]);

  // Listen for arrow keydowns
  // TODO: use react synthetic onKeyDown events instead?
  const reviewMode = useSelector(selectReviewMode);
  const isAddingLabel = useSelector(selectIsAddingLabel);
  const modalOpen = useSelector(selectModalOpen);
  // const username = useSelector(selectUserUsername);
  const handleKeyDown = useCallback((e) => {
    if (!image || isAddingLabel || modalOpen) return;
    let charCode = String.fromCharCode(e.which).toLowerCase();

    // key listeners for increment/decrement
    const delta = (e.code === 'ArrowLeft' || charCode === 'a')
      ? 'decrement'
      : (e.code === 'ArrowRight' || charCode === 'd')
        ? 'increment'
        : null;

    if (delta) {
      reviewMode
        ? dispatch(incrementFocusIndex(delta))
        : dispatch(incrementImage(delta));
    }

    // TODO: review this. it looks like it could be buggy (in reviewMode)

    // // handle return, left/right arrows (invalidate/validate)
    // const object = image.objects[focusIndex.object];
    // if (reviewMode && object && !object.locked && focusIndex.label) {
    //   const label = object[focusIndex.label];
    //   let validated;
    //   if (e.code === 'ArrowRight' || e.code === 'Enter') validated = true;
    //   if (e.code === 'ArrowLeft') validated = false;
    //   if (typeof variable == 'boolean') {
    //     dispatch(labelValidated({
    //       userId: username,
    //       imageId: image._id,
    //       objId: object._id,
    //       labelId: label._id,
    //       validated,
    //     }));
    //     dispatch(incrementFocusIndex('increment'));
    //   }
    // }

    // handle ctrl-z/shift-ctrl-z (undo/redo)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && charCode === 'z') {
      dispatch(undoActions.redo());
      // dispatch(UndoActionCreators.redo());
    }
    else if ((e.ctrlKey || e.metaKey) && charCode === 'z') {
      dispatch(undoActions.undo());
      // dispatch(UndoActionCreators.undo());
    }

    // // handle ctrl-a (add object)
    // if (reviewMode) {
    //   let charCode = String.fromCharCode(e.which).toLowerCase();
    //   if ((e.ctrlKey || e.metaKey) && charCode === 'a') {
    //     e.stopPropagation();
    //     dispatch(drawBboxStart());
    //   }
    // }
  }, [dispatch, image, isAddingLabel, modalOpen, reviewMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => { 
      window.removeEventListener('keydown', handleKeyDown) 
    }
  }, [ handleKeyDown ]);

  const handleIncrementClick = (delta) => {
    reviewMode
      ? dispatch(incrementFocusIndex(delta))
      : dispatch(incrementImage(delta));
  }

  return (
    <StyledLoupeFooter>
      <ProgressDisplay>
        <ProgressBar>
          <ProgressIndicator css={{ width: progress + `%` }} />
        </ProgressBar>
        <IndexDisplay>
          <Index>{focusIndex.image + 1} / {imageCount}</Index>
          <IndexUnit>images</IndexUnit>
        </IndexDisplay>
      </ProgressDisplay>
      <IncrementControls>
        <IconButton
          variant='ghost'
          size='large'
          onClick={() => handleIncrementClick('decrement')}
        >
          <ChevronLeftIcon/>
        </IconButton>
        <IconButton
          variant='ghost'
          size='large'
          onClick={() => handleIncrementClick('increment')}
        >
          <ChevronRightIcon/>
        </IconButton>
      </IncrementControls>
    </StyledLoupeFooter>
  );
};

export default LoupeFooter;
