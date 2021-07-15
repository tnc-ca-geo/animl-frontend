import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { styled } from '../../theme/stitches.config.js';
import { checkboxFilterToggled, selectActiveFilters } from './filtersSlice';
import { fetchCameras, selectCameras } from '../cameras/camerasSlice';

import Checkbox from '../../components/Checkbox';

const CameraSection = styled.div({
  fontFamily: '$mono',
  fontSize: '$3',
});

const CheckboxLabel = styled.span({
  marginLeft: '$2',
  fontFamily: '$mono',
  fontSize: '$3',
  ':hover': {
    cursor: 'pointer',
  },
});

const DeploymentCheckboxWrapper = styled.div({
  marginBottom: '$2',
  marginLeft: '$4',
});


const CheckboxWrapper = styled.div({
  marginBottom: '$2',
  marginLeft: '$2',
});

const CameraFilter = ({ availCams, activeCams }) => {
  const cameras = useSelector(selectCameras);
  const activeFilters = useSelector(selectActiveFilters);
  const activeDeps = activeFilters.deployments;
  const dispatch = useDispatch();

  useEffect(()=> {
    if (!cameras.cameras.length &&
        !cameras.noneFound && 
        !cameras.error) {
      dispatch(fetchCameras());
    }
  }, [cameras, dispatch]);

  const handleCheckboxChange = (e) => {
    dispatch(checkboxFilterToggled({
      filter: e.target.dataset.filter,
      key: e.target.dataset.key,
      val: e.target.dataset.sn,
    }));
  };

  return (
    <div>
      {cameras.cameras.map((camera) => {
        return (
          <CameraSection key={camera._id}>

            <CheckboxWrapper key={camera._id}>
              <label>
                <Checkbox
                  checked={activeCams === null || 
                    activeCams.includes(camera._id)
                  }
                  data-filter={'cameras'}
                  data-key={'ids'}
                  data-sn={camera._id}
                  onChange={handleCheckboxChange}
                />
                <CheckboxLabel>{camera._id}</CheckboxLabel>
              </label>
            </CheckboxWrapper>

            {camera.deployments.map((deployment) => (
              <DeploymentCheckboxWrapper key={deployment._id}>
                <label>
                  <Checkbox
                    checked={activeDeps === null ||
                      activeDeps.includes(deployment._id)
                    }
                    data-filter={'deployments'}
                    data-key={'ids'}
                    data-sn={deployment._id}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel>{deployment.name}</CheckboxLabel>
                </label>
              </DeploymentCheckboxWrapper>
            ))}
          </CameraSection>
        )
      })}
    </div>
  );
};

export default CameraFilter;

