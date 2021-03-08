import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

import {
  labelValidated,
  incrementFocusIndex,
  incrementImage,
  selectImages,
  selectImagesCount,
  selectFocusIndex,
} from '../images/imagesSlice';
import {
  loupeOpened,
  reviewModeToggled,
  addObjectStart,
  selectReviewMode,
} from './loupeSlice';
import PanelHeader from '../../components/PanelHeader';
import FullSizeImage from './FullSizeImage';
import Button from '../../components/Button';

const IndexDisplay = styled.div({
  fontFamily: '$mono',
  fontSize: '$3',
  fontWeight: '$1',
  marginRight: '$3',
  // minWidth: '200px',
  display: 'flex',
  alignItems: 'center',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '160px',
});

const Index = styled('span', {
  color: '$hiContrast',
  marginRight: '$3',
})

const IndexUnit = styled('span', {
  color: '$gray600',
});

const ProgressBar = styled.div({
  height: '$1',
  width: '100%',
  backgroundColor: '$gray300',
  position: 'relative',
  borderRadius: '$2',
});

const ProgressIndicator = styled.span({
  backgroundColor: '$blue600',
  height: '$1',
  position: 'absolute',
  display: 'block',
  borderRadius: '$2',
});

const ProgressDisplay = styled.div({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  paddingRight: '$2',
})

// const LabelsPane = styled.div({
//   padding: '$3',
// });

const ItemValue = styled.div({
  fontSize: '$3',
  fontFamily: '$mono',
  color: '$hiContrast',
});

const ItemLabel = styled.div({
  fontSize: '$3',
  color: '$gray600',
  marginBottom: '$2',
});

const StyledItem = styled.div({
  marginBottom: '$3',
  marginRight: '$4',
});

const Item = ({label, value}) => (
  <StyledItem>
    <ItemLabel>{label}</ItemLabel>
    <ItemValue>{value}</ItemValue>
  </StyledItem>
);

const MetadataList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
});

const MetadataPane = styled.div({
  padding: '$3 0',
  marginBottom: '$6',
});

const StyledInfoPaneHeader = styled.div({
  fontSize: '$5',
  fontWeight: '$5',
  paddingBottom: '$2',
  borderBottom: '$1 solid $gray400',
  marginBottom: '$3',
  'span': {
    paddingBottom: '$2',
    borderBottom: '$1 solid $gray600',
  },
});

const InfoPaneHeader = ({ label }) => (
  <StyledInfoPaneHeader>
    <span>{label}</span>
  </StyledInfoPaneHeader>
);

const ImagePane = styled.div({
  background: 'aliceblue',
});

const LoupeBody = styled.div({
  flexGrow: 1,
  display: 'grid',
  margin: '$3',
});

const StyledLoupe = styled.div({
  boxSizing: 'border-box',
  width: 'calc(100% - 810px)',
  height: 'calc(100% - 56px)',
  position: 'absolute',
  backgroundColor: '$loContrast',
  borderLeft: '$1 solid $gray400',
  marginLeft: '100%',
  // transition: 'margin-left 0.3s ease-out',

  variants: {
    expanded: {
      true: {
        marginLeft: '745px',
      },
    }
  }

});

const Loupe = ({ expanded }) => {
  const reviewMode = useSelector(selectReviewMode);
  const imageCount = useSelector(selectImagesCount);
  const focusIndex = useSelector(selectFocusIndex);
  const images = useSelector(selectImages);
  const [ image, setImage ] = useState(images[focusIndex.image]);
  const progress = (focusIndex.image / imageCount) * 100;
  const dispatch = useDispatch();

  // Listen for arrow keydowns
  // TODO: should be able to use react synthetic onKeyDown events instead
  useEffect(() => {
    const handleKeyDown = (e) => {
      
      if (!image) {
        return;
      }

      // handle up/down arrows (increment/decrement)
      const delta = (e.code === 'ArrowUp')
        ? 'decrement'
        : (e.code === 'ArrowDown')
          ? 'increment'
          : null;
  
      if (delta) {
        reviewMode
          ? dispatch(incrementFocusIndex(delta))
          : dispatch(incrementImage(delta));
      }

      // handle return, left/right arrows (invalidate/validate)
      const object = image.objects[focusIndex.object];
      if (reviewMode && object && !object.locked) {
        if (e.code === 'Enter') { console.log('enter') }
        if (e.code === 'ArrowRight' || e.code === 'Enter') {
          console.log('arrow right / enter handler firing')
          dispatch(labelValidated({ index: focusIndex, validated: true}));
          dispatch(incrementFocusIndex('increment'));
        }
        if (e.code === 'ArrowLeft') {
          dispatch(labelValidated({ index: focusIndex, validated: false })); 
          dispatch(incrementFocusIndex('increment'));
        }
      }

      // handle ctrl-z/shift-ctrl-z (undo/redo)
      let charCode = String.fromCharCode(e.which).toLowerCase();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && charCode === 'z') {
        dispatch(UndoActionCreators.redo());
      }
      else if ((e.ctrlKey || e.metaKey) && charCode === 'z') {
        dispatch(UndoActionCreators.undo());
      }
      

      // // handle ctrl-a (add object)
      // if (reviewMode) {
      //   let charCode = String.fromCharCode(e.which).toLowerCase();
      //   if ((e.ctrlKey || e.metaKey) && charCode === 'a') {
      //     e.stopPropagation();
      //     dispatch(addObjectStart());
      //   }
      // }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ reviewMode, focusIndex, image, dispatch ]);

  useEffect(() => {
    console.log('new focusIndex: ', focusIndex)
    setImage(images[focusIndex.image]);
  }, [images, focusIndex])

  const handleToggleReviewMode = (e) => {
    dispatch(reviewModeToggled());
    e.currentTarget.blur();
  }

  const handleLoupeClose = () => dispatch(loupeOpened(false));

  const handleAddObjectButtonClick = () => {
    dispatch(addObjectStart());
  }

  return (
    <StyledLoupe expanded={expanded}>
      <PanelHeader handlePanelClose={handleLoupeClose}>
        <ProgressDisplay>
          <IconButton
            variant='ghost'
            onClick={handleToggleReviewMode}
          >
            <FontAwesomeIcon
              icon={ reviewMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off'] }
            />
          </IconButton>
          <IndexDisplay>
            <Index>{focusIndex.image + 1} / {imageCount}</Index>
            <IndexUnit>images</IndexUnit>
          </IndexDisplay>
          <ProgressBar>
            <ProgressIndicator css={{ width: progress + `%` }} />
          </ProgressBar>
        </ProgressDisplay>
      </PanelHeader>
      <LoupeBody className={expanded ? 'expanded' : null}>
        {image &&
          <div>
            <ImagePane>
              <FullSizeImage image={image} focusIndex={focusIndex} />
            </ImagePane>
            <Button
              onClick={handleAddObjectButtonClick}
              size='small'
              css={{
                position: 'absolute',
                right: '16px',
                marginTop: '8px',
              }}
            >
              <FontAwesomeIcon icon={['fas', 'plus']} />
              Add object
            </Button>
            <MetadataPane>
              <InfoPaneHeader label='Metadata' />
              <MetadataList>
                <Item label='Date created' value={image.dateTimeOriginal}/>
                <Item label='Camera' value={image.cameraSn}/>
                <Item label='Camera make' value={image.make}/>
                <Item label='File name' value={image.originalFileName}/>
              </MetadataList>
            </MetadataPane>
          </div>
        }
      </LoupeBody>
    </StyledLoupe>
  );
};

export default Loupe;
