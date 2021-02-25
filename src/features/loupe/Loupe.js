import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

import {
  selectImages,
  selectImagesCount,
  labelValidated,
} from '../images/imagesSlice';
import {
  loupeClosed,
  incrementIndex, 
  reviewModeToggled,
  selectReviewMode,
  selectIndex,
} from './loupeSlice';
import PanelHeader from '../../components/PanelHeader';
import FullSizeImage from './FullSizeImage';

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

const key = {
  left: 37,
  right: 39,
  up: 38,
  down: 40,
};

const Loupe = ({ expanded }) => {
  const reviewMode = useSelector(selectReviewMode);
  const imageCount = useSelector(selectImagesCount);
  const index = useSelector(selectIndex);
  const images = useSelector(selectImages);
  const [ image, setImage ] = useState(images[index.images]);
  const progress = (index.images / imageCount) * 100;
  const dispatch = useDispatch();

  // Listen for arrow keydowns
  // TODO: should be able to use react synthetic onKeyDown events instead
  useEffect(() => {
    const handleKeyDown = (e) => {
      
      if (!image) {
        return;
      }

      const delta = (e.keyCode === key.up)
        ? 'decrement'
        : (e.keyCode === key.down)
          ? 'increment'
          : null;
  
      if (delta) {
        dispatch(incrementIndex(delta)); 
      }

      const object = image.objects[index.objects];
      if (reviewMode && object && !object.locked) {
        if (e.keyCode === key.right) {
          dispatch(labelValidated({ index: index, validated: true}));
          dispatch(incrementIndex('increment'));
        }
        if (e.keyCode === key.left) {
          dispatch(labelValidated({ index: index, validated: false })); 
          dispatch(incrementIndex('increment'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [ reviewMode, index, image, dispatch ]);

  useEffect(() => {
    setImage(images[index.images]);
  }, [images, index.images])

  const handleToggleReviewMode = () => dispatch(reviewModeToggled());

  const handleLoupeClose = () => dispatch(loupeClosed());

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
            <Index>{index.images + 1} / {imageCount}</Index>
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
              <FullSizeImage image={image} loupeIndex={index} />
            </ImagePane>
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
