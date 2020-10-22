import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { useSelector } from 'react-redux';
import {
  detailsModalClosed,
  selectDetailsOpen, 
  selectDetailsIndex,
} from './imagesSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

const DetailsBody = styled.div({
  display: 'grid',
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
  top: '$6',
  left: '$6',
  width: 'calc(100vw - 64px)',
  height: 'calc(100vh - 64px)',
  backgroundColor: '$loContrast',
  display: 'grid',
  border: '$1 solid $gray400',
  boxShadow: 'rgba(22, 23, 24, 0.35) 0px 10px 38px -10px, rgba(22, 23, 24, 0.2) 0px 10px 20px -15px',
});

const DetailsModal = () => {
  const imageIndex = useSelector(selectDetailsIndex);
  const [ reviewMode, setReviewMode ] = useState(false);
  const dispatch = useDispatch();

  const handleToggleReviewMode = () => setReviewMode(!reviewMode);
  const handleCloseButtonClick = () => dispatch(detailsModalClosed());

  return (
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
        details for image: {imageIndex}
      </DetailsBody>
    </DetailsModalContainer>
  );
};

export default DetailsModal
