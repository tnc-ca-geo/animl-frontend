import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { 
  objectFilterToggled,
  selectHasLockedObjects,
  selectHasUnlockedObjects
} from './filtersSlice';
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

const ObjectFilter = () => {
  const dispatch = useDispatch();
  const hasLockedObjects = useSelector(selectHasLockedObjects);
  const hasUnlockedObjects = useSelector(selectHasUnlockedObjects);

  console.log('hasLockedObjects: ', hasLockedObjects)

  const handleCheckboxChange = (e) => {
    console.log('e: ', e.target.dataset)
    const objFilter = e.target.dataset.objFilter;
    dispatch(objectFilterToggled({type: objFilter}));
  };

  return (
    <>
      <CheckboxWrapper>
        <label>
          <Checkbox
            checked={hasLockedObjects}
            data-obj-filter={'hasLockedObjects'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel>locked objects</CheckboxLabel>
        </label>
      </CheckboxWrapper>
      <CheckboxWrapper>
        <label>
          <Checkbox
            checked={hasUnlockedObjects}
            data-obj-filter={'hasUnlockedObjects'}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel>unlocked objects</CheckboxLabel>
        </label>
      </CheckboxWrapper>
    </>
  );
};

export default ObjectFilter;
