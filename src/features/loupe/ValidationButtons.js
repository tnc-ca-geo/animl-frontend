import React from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { labelValidated, objectManuallyUnlocked } from '../review/reviewSlice';

const LabelButton = styled('button', {
  padding: '0',
  width: '26px',
  height: '24px',
  borderRadius: '0px',
  border: '2px solid',
  borderLeft: '1px solid',
  '&:hover': {
    cursor: 'pointer',
  },
});

const StyledValidationButtons = styled('div', {
  position: 'relative',
});

const ValidationButtons = ({
  index,
  object,
  labelColor,
  username,
  setShowLabelButtons
}) => {
  const dispatch = useDispatch();

  const handleLockButtonClick = (e) => {
    e.stopPropagation();
    dispatch(objectManuallyUnlocked({ index }));
  };

  const handleValidationButtonClick = (e, validated) => {
    e.stopPropagation();
    const payload = {
      userId: username,
      index,
      validated,
    };
    dispatch(labelValidated(payload));
    setShowLabelButtons(false);
  };

  return (
    <StyledValidationButtons>
      {object.locked
        ? <LabelButton
            onClick={handleLockButtonClick}
            css={{
              color: '$loContrast',
              backgroundColor: labelColor.primary,
              borderColor: labelColor.primary,
              '&:hover': {
                backgroundColor: '$loContrast',
                color: '$hiContrast',
              }
          }}>
            <FontAwesomeIcon icon={['fas', 'unlock']}/>
          </LabelButton>              
        : <>
            <LabelButton
              onClick={(e) => handleValidationButtonClick(e, false)}
              css={{
                backgroundColor: '#E04040',
                color: '$loContrast',
                borderColor: labelColor.primary,
                '&:hover': {
                  color: '#E04040',
                  backgroundColor: '$loContrast',
                  borderColor: labelColor.primary,
                }
              }}
            >
              <FontAwesomeIcon icon={['fas', 'times']} />
            </LabelButton>
            <LabelButton
              onClick={(e) => handleValidationButtonClick(e, true)}
              css={{
                backgroundColor: '#00C797',
                color: '$loContrast',
                borderColor: labelColor.primary,
                '&:hover': {
                  color: '#00C797',
                  backgroundColor: '$loContrast',
                  borderColor: labelColor.primary,
                }
              }}
            >
              <FontAwesomeIcon icon={['fas', 'check']} />
            </LabelButton>
          </>
      }
    </StyledValidationButtons>
  );
};

export default ValidationButtons;

