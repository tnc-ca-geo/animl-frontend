import React from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Cross2Icon, CheckIcon, LockOpen1Icon } from '@radix-ui/react-icons';
import { labelsValidated, objectsManuallyUnlocked } from '../review/reviewSlice.js';

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
  display: 'flex',
  alignItems: 'center',
});

const ValidationButtons = ({
  imgId,
  object,
  label,
  labelColor,
  username,
}) => {
  const dispatch = useDispatch();

  const handleLockButtonClick = (e) => {
    e.stopPropagation();
    dispatch(objectsManuallyUnlocked({ objects: [{ imgId, objId: object._id }] }));
  };

  const handleValidationButtonClick = (e, validated) => {
    e.stopPropagation();
    dispatch(labelsValidated({
      labels: [{
        userId: username,
        imgId,
        objId: object._id,
        lblId: label._id,
        validated,
      }]
    }));
  };

  return (
    <StyledValidationButtons>
      {object.locked
        ? <LabelButton
            onClick={handleLockButtonClick}
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '$loContrast',
              backgroundColor: labelColor.base,
              borderColor: labelColor.base,
              '&:hover': {
                backgroundColor: '$loContrast',
                color: '$hiContrast',
              }
          }}>
            <LockOpen1Icon/>
          </LabelButton>              
        : <>
            <LabelButton
              onClick={(e) => handleValidationButtonClick(e, false)}
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#E04040',
                color: '$loContrast',
                borderColor: labelColor.base,
                '&:hover': {
                  color: '#E04040',
                  backgroundColor: '$loContrast',
                  borderColor: labelColor.base,
                }
              }}
            >
              <Cross2Icon />
            </LabelButton>
            <LabelButton
              onClick={(e) => handleValidationButtonClick(e, true)}
              css={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00C797',
                color: '$loContrast',
                borderColor: labelColor.base,
                '&:hover': {
                  color: '#00C797',
                  backgroundColor: '$loContrast',
                  borderColor: labelColor.base,
                }
              }}
            >
              <CheckIcon />
            </LabelButton>
          </>
      }
    </StyledValidationButtons>
  );
};

export default ValidationButtons;

