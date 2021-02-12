import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import {
  selectImages,
  selectImagesCount,
} from '../images/imagesSlice';
import {
  loupeClosed,
  incrementImageIndex, 
  selectImageIndex,
} from './loupeSlice';
import PanelHeader from '../../components/PanelHeader';
import FullSizeImage from './FullSizeImage';

const IndexDisplay = styled.div({
  fontFamily: '$mono',
  fontSize: '$3',
  marginRight: '$3',
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
  height: '2px',
  width: '100%',
  backgroundColor: '$gray300',
  position: 'relative',
});

const ProgressIndicator = styled.span({
  backgroundColor: '$hiContrast',
  height: '2px',
  position: 'absolute',
  display: 'block',
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
  const imageCount = useSelector(selectImagesCount);
  const imageIndex = useSelector(selectImageIndex);
  const images = useSelector(selectImages);
  const [ image, setImage ] = useState(images[imageIndex]);
  const progress = (imageIndex / imageCount) * 100;
  const [ reviewMode, setReviewMode ] = useState(false);
  const dispatch = useDispatch();

  // Listen for left/right arrow keydowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      const delta = (e.keyCode === 37) ? 'decrement'
                  : (e.keyCode === 39) ? 'increment'
                  : null;
      dispatch(incrementImageIndex({ delta })); 
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [reviewMode, dispatch]);

  useEffect(() => {
    setImage(images[imageIndex]);
  }, [images, imageIndex])

  const handleToggleReviewMode = () => setReviewMode(!reviewMode);

  const handleLoupeClose = () => dispatch(loupeClosed());

  return (
    <StyledLoupe expanded={expanded}>
      <PanelHeader handlePanelClose={handleLoupeClose}>
        <ProgressDisplay>
          <IndexDisplay>
            <Index>{imageIndex + 1} / {imageCount}</Index> 
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
              <FullSizeImage image={image} />
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
