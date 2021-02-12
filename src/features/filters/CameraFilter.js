import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { checkboxFilterToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';

const CheckboxLabel = styled.span({
  marginLeft: '$2',
  fontFamily: '$mono',
  fontSize: '$3',
  ':hover': {
    cursor: 'pointer',
  },
});

const CheckboxWrapper = styled.div({
  marginBottom: '$1',
});

const CameraFilter = ({ availCams, activeCams }) => {
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    const payload = {
      filter: 'cameras',
      key: 'ids',
      val: e.target.dataset.sn,
    };
    dispatch(checkboxFilterToggled(payload));
  };

  return (
    <div>
      {availCams.ids.map((id) => {
        return (
          <CheckboxWrapper key={id}>
            <label>
              <Checkbox
                checked={activeCams === null || activeCams.includes(id)}
                data-sn={id}
                onChange={handleCheckboxChange}
              />
              <CheckboxLabel>{id}</CheckboxLabel>
            </label>
          </CheckboxWrapper>
        )
      })}
    </div>
  );
};

export default CameraFilter;

