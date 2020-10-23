import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import {
  detailsModalClosed,
  incrementImageIndex,
  selectDetailsOpen, 
  selectDetailsIndex,
  selectImages,
} from './imagesSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FullSizeImage from './FullSizeImage';
import LabelsTable from './LabelsTable';
import IconButton from '../../components/IconButton';

const ProgressBar = styled.div({
  height: '40px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'papayawhip',
});

const LabelsPane = styled.div({
  padding: '$3',
});

const ItemValue = styled.div({
  fontSize: '$4',
  fontFamily: '$mono',
  color: '$hiContrast',
});

const ItemLabel = styled.div({
  fontSize: '$3',
  color: '$gray600',
  marginBottom: '$2',
});

const StyledItem = styled.div({
  marginBottom: '$4',
});

const Item = ({label, value}) => (
  <StyledItem>
    <ItemLabel>{label}</ItemLabel>
    <ItemValue>{value}</ItemValue>
  </StyledItem>
);

const MetadataList = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const MetadataPane = styled.div({
  padding: '$3',
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

const ImageDetails = styled.div({
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
});

const ThumbnailsStrip = styled.div({
  width: '100%',
  height: '112px',
  backgroundColor: 'lavender',
});

const DetailsBody = styled.div({
  flexGrow: 1,
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  margin: '$3',
});

const ControlGroup = styled.div({
  display: 'flex',
  alignItems: 'center',
  'button': {
    marginRight: '$1',
  },
});

const DetailsHeader = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$0 $3',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  fontWeight: '$5',
});

const DetailsModalContainer = styled.div({
  zIndex: '$2',
  position: 'fixed',    
  width: '95%',
  height: '95%',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$loContrast',
  border: '$1 solid $gray400',
  boxShadow: 'rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, rgba(22, 23, 24, 0.2) 0px 10px 20px -15px',
});

const DetailsModalWrapper = styled.div({
  position: 'fixed',
  top: '$0',
  left: '$0',
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.6)',
})


const DetailsModal = () => {
  const imageIndex = useSelector(selectDetailsIndex);
  const images = useSelector(selectImages);
  const image = images[imageIndex];
  const [ reviewMode, setReviewMode ] = useState(false);
  const dispatch = useDispatch();

  const handleToggleReviewMode = () => setReviewMode(!reviewMode);
  const handleCloseButtonClick = () => dispatch(detailsModalClosed());

  // Listen for left/right arrow keydowns
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 37 || e.keyCode === 39) {
        const decrement = (e.keyCode === 37) ? true : false
        dispatch(incrementImageIndex({decrement}));
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [reviewMode, dispatch]);

  return (
    <DetailsModalWrapper>
      <DetailsModalContainer>
        <DetailsHeader>
          <ControlGroup>
            Label review mode
            <IconButton 
              variant='ghost'
              onClick={handleToggleReviewMode}
            >
              <FontAwesomeIcon icon={
                reviewMode ? ['fas', 'toggle-on'] : ['fas', 'toggle-off']
              }/>
            </IconButton>
            <IconButton variant='ghost'>
              <FontAwesomeIcon icon={['fas', 'cog']} />
            </IconButton>
          </ControlGroup>
          <IconButton
            variant='ghost'
            onClick={handleCloseButtonClick}
          >
            <FontAwesomeIcon icon={['fas', 'times']} />
          </IconButton>
        </DetailsHeader>
        <DetailsBody>
          <ThumbnailsStrip>
            thumbnails
          </ThumbnailsStrip>
          <ImageDetails>
            <ImagePane>
              <FullSizeImage image={image} />
            </ImagePane>
            <div>
              <MetadataPane>
                <InfoPaneHeader label='Metadata' />
                <MetadataList>
                  <Item label='Date created' value={image.dateTimeOriginal}/>
                  <Item label='Camera' value={image.cameraSn}/>
                  <Item label='Camera make' value={image.make}/>
                </MetadataList>
              </MetadataPane>
              <LabelsPane>
                <InfoPaneHeader label='Labels' />
                <LabelsTable labels={image.labels}/>
              </LabelsPane>
            </div>
          </ImageDetails>
          <ProgressBar>
            progress bar
          </ProgressBar>
        </DetailsBody>
      </DetailsModalContainer>
    </DetailsModalWrapper>
  );
};

export default DetailsModal
