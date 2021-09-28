import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { styled } from '../../theme/stitches.config.js';
import { checkboxFilterToggled, selectActiveFilters } from './filtersSlice';
import { fetchCameras, selectCameras } from '../cameras/camerasSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';

const CameraSection = styled.div({
  // fontFamily: '$mono',
  fontSize: '$3',
  borderBottom: '$1 solid $gray400',
});

const DeploymentCheckboxWrapper = styled.div({
  marginBottom: '$2',
  marginLeft: '$5',
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
  }, [cameras.cameras, cameras.noneFound, cameras.error, dispatch]);

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
        const checked = activeCams === null || activeCams.includes(camera._id);

        return (
          <CameraSection key={camera._id}>

            <CheckboxWrapper key={camera._id}>
              <label>
                <Checkbox
                  checked={checked}
                  data-filter={'cameras'}
                  data-key={'ids'}
                  data-sn={camera._id}
                  onChange={handleCheckboxChange}
                />
                <CheckboxLabel checked={checked}>{camera._id}</CheckboxLabel>
              </label>
            </CheckboxWrapper>

            {camera.deployments.map((deployment) => {
              const checked = activeDeps === null || 
                              activeDeps.includes(deployment._id);
                              
              return (
                <DeploymentCheckboxWrapper key={deployment._id}>
                  <label>
                    <Checkbox
                      checked={checked}
                      data-filter={'deployments'}
                      data-key={'ids'}
                      data-sn={deployment._id}
                      onChange={handleCheckboxChange}
                    />
                    <CheckboxLabel checked={checked}>{deployment.name}</CheckboxLabel>
                  </label>
                </DeploymentCheckboxWrapper>
              )
            })}
          </CameraSection>
        )
      })}
    </div>
  );
};

export default CameraFilter;

