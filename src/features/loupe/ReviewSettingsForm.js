import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { iterationOptionsChanged, selectIterationOptions } from './loupeSlice';
import Modal from '../../components/Modal';
import Checkbox from '../../components/Checkbox';

const CheckboxLabel = styled.span({
  marginLeft: '$2',
  fontWeight: '$3',
  fontSize: '$3',
  color: '$hiContrast',
  ':hover': {
    cursor: 'pointer',
  },
});

const CheckboxWrapper = styled.div({
  marginBottom: '$1',
});

const Options = styled.div({
  marginTop: '$4',
});

const StyledReviewSettings = styled.div({
  fontFamily: 'roboto',
  fontSize: '$3',
  fontWeight: '$3',
  color: '$gray600',
})

const ReviewSettingsForm = ({handleClose}) => {
  const iterationOptions = useSelector(selectIterationOptions);
  const iterationOptionsText = {
      skipEmptyImages: 'Skip empty images',
      skipLockedObjects: 'Skip locked objects',
  };

  const dispatch = useDispatch();
  const handleCheckboxChange = (e) => {
    const toggledOption = e.target.dataset.option;
    const newOptions = {...iterationOptions};
    newOptions[toggledOption] = !iterationOptions[toggledOption];
    dispatch(iterationOptionsChanged(newOptions));
  };

  return (
    <Modal
      handleClose={handleClose}
      title='Label review settings'
      size='sm'
    >
      <StyledReviewSettings>
        <p>
          When label review mode is active, the following settings will apply:
        </p>
        <Options>
          {Object.entries(iterationOptions).map(([option, toggledOn]) => (
            <CheckboxWrapper key={option}>
              <label>
                <Checkbox
                  checked={toggledOn}
                  data-option={option}
                  onChange={handleCheckboxChange}
                />
                <CheckboxLabel>{iterationOptionsText[option]}</CheckboxLabel>
              </label>
            </CheckboxWrapper>
          ))}
        </Options>
      </StyledReviewSettings>
    </Modal>
  )
};

export default ReviewSettingsForm;