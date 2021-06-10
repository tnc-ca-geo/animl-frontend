import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import { selectImages } from '../images/imagesSlice';
import { selectFocusIndex } from '../review/reviewSlice';
import {
  toggleOpenLoupe,
  reviewModeToggled,
  selectReviewMode,
} from './loupeSlice';
import PanelHeader from '../../components/PanelHeader';
import FullSizeImage from './FullSizeImage';
import LoupeFooter from './LoupeFooter'

const ItemValue = styled.div({
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$hiContrast',
});

const ItemLabel = styled.div({
  fontSize: '$2',
  color: '$gray600',
  fontFamily: '$mono',
  marginBottom: '$1',
});

const StyledItem = styled.div({
  marginBottom: '$3',
  marginRight: '$5',
  textAlign: 'center',
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
  paddingTop: '$3',
  // marginBottom: '$6',
  display: 'flex',
  justifyContent: 'center',
});

const ImagePane = styled.div({
  display: 'flex',
  justifyContent: 'center',
  // maxWidth: '900px',
});

const LoupeBody = styled.div({
  flexGrow: 1,
  display: 'grid',
  margin: '$3',
});

const StyledLoupe = styled.div({
  boxSizing: 'border-box',
  flexGrow: '1',
  position: 'relative',
  backgroundColor: '$loContrast',
  borderLeft: '$1 solid $gray400',
});


const Loupe = () => {
  const dispatch = useDispatch();

  // track focused image
  const focusIndex = useSelector(selectFocusIndex);
  const images = useSelector(selectImages);
  const [ image, setImage ] = useState();
  useEffect(() => {
    console.log('new focusIndex: ', focusIndex);
    setImage(images[focusIndex.image]);
  }, [ images, focusIndex ]);

  // track reivew mode
  const reviewMode = useSelector(selectReviewMode);
  const handleToggleReviewMode = (e) => {
    dispatch(reviewModeToggled());
    e.currentTarget.blur();
  }

  const handleCloseLoupe = () => dispatch(toggleOpenLoupe(false));

  return (
    <StyledLoupe>
      <PanelHeader handlePanelClose={handleCloseLoupe} />
      <LoupeBody>
        {image &&
          <div>
            <ImagePane>
              <FullSizeImage
                image={image}
                focusIndex={focusIndex}
              />
            </ImagePane>
            <MetadataPane>
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
      <LoupeFooter image={image}/>
    </StyledLoupe>
  );
};

export default Loupe;
