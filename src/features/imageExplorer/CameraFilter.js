import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchCameras,
  selectCameras,
  cameraToggled,
} from './imagesSlice';

import { Grid, Row, Col } from '../../components/Grid';
import Checkbox from '../../components/Checkbox';

const CameraFilter = () => {
  const cameras = useSelector(selectCameras);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('fetching cameras')
    dispatch(fetchCameras());
  }, [dispatch])

  const handleCheckboxChange = (e) => {
    console.log('checkbox changed: ', e.target.dataset.sn);
    const sn = e.target.dataset.sn;
    dispatch(cameraToggled(sn));
  }

  return (
    <Grid>
      {Object.keys(cameras).map((sn) => {
        console.log('building camera checkbox for camera: ', sn);
        console.log('checked? ', cameras[sn].selected);
        return (
          <div key={sn}>
            <label>
              <Checkbox
                checked={cameras[sn].selected}
                data-sn={sn}
                onChange={handleCheckboxChange}
              />
              <span style={{ marginLeft: 8 }}>{sn}</span>
            </label>
          </div>
        )
      })}
    </Grid>
  );
};

export default CameraFilter;

