import React, { } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { selectCameras } from './camerasSlice';
import Accordion from '../../components/Accordion';

const CameraList = styled.div({
  border: '$1 solid $gray400',
  borderBottom: 'none',

});

const DeploymentItem = styled.div({
  paddingTop: '$2',
  paddingBottom: '$2',
  ':not(:last-child)': {
    borderBottom: '$1 solid $gray400',
  }
});


const CameraAdminModal = () => {
  const cameras = useSelector(selectCameras);
  const dispatch = useDispatch();

  return (
    <div>
      <CameraList>
        {cameras.cameras.map((cam) => (
          <Accordion
            key={cam._id}
            label={cam._id}
            expandedDefault={true}
          >
            {cam.deployments.map((dep) => (
              <DeploymentItem key={dep._id}> 
                {dep.name}
              </DeploymentItem>
            ))}
          </Accordion>
        ))}
      </CameraList>
    </div>
  );
};

export default CameraAdminModal;

