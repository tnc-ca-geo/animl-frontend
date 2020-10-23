import React, { useEffect, useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCameras,
  selectCameraFilter,
  cameraToggled,
} from './imagesSlice';
import Checkbox from '../../components/Checkbox';

const CheckboxLabel = styled.span({
  marginLeft: '$2',
  fontFamily: '$mono',
  fontSize: '$3',
  ':hover': {
    cursor: 'pointer',
  },
});

const CameraFilter = () => {
  const cameras = useSelector(selectCameraFilter);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch])

  const handleCheckboxChange = (e) => {
    const sn = e.target.dataset.sn;
    dispatch(cameraToggled(sn));
  };

  return (
    <div>
      {Object.keys(cameras).map((sn) => {
        return (
          <div key={sn}>
            <label>
              <Checkbox
                checked={cameras[sn].selected}
                data-sn={sn}
                onChange={handleCheckboxChange}
              />
              <CheckboxLabel>{sn}</CheckboxLabel>
            </label>
          </div>
        )
      })}
    </div>
  );
};

export default CameraFilter;

