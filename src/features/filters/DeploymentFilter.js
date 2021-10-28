import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { styled } from '../../theme/stitches.config.js';
import { 
  checkboxFilterToggled,
  selectActiveFilters,
  selectAvailDeployments,
} from './filtersSlice';
import { fetchCameras, selectCameras } from '../cameras/camerasSlice';
import Accordion from '../../components/Accordion';
import BulkSelect from './BulkSelect';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';

const Deployments = styled('div', {
  marginLeft: '$2',
  borderLeft: '1px solid $gray400',
});

const CameraSection = styled('div', {
  // fontFamily: '$mono',
  fontSize: '$3',
  // '&:nth-child(odd)': {
  //   backgroundColor: '$loContrast',
  // }
});

const DeploymentCheckboxWrapper = styled(CheckboxWrapper, {
  marginLeft: '$3',
});

const DeploymentFilter = ({ availCams, activeCams }) => {
  const cameras = useSelector(selectCameras);
  const activeFilters = useSelector(selectActiveFilters);
  const activeDeps = activeFilters.deployments;
  const availDeps = useSelector(selectAvailDeployments);
  const selectedDepCount = activeDeps 
    ? activeDeps.length
    : availDeps.ids.length;
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
    <Accordion 
      label='Deployments'
      selectedCount={selectedDepCount}
      expandedDefault={false}
    >
      <BulkSelect filterIds={['cameras', 'deployments']} />
      <div>
        {cameras.cameras.map((camera) => {
          const camChecked = activeCams === null || 
                            activeCams.includes(camera._id);

          return (
            <CameraSection key={camera._id}>
              <CheckboxWrapper key={camera._id}>
                <label>
                  <Checkbox
                    checked={camChecked}
                    active={camChecked}
                    data-filter={'cameras'}
                    data-key={'ids'}
                    data-sn={camera._id}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel checked={camChecked} active={camChecked}>
                    {camera.make} - {camera._id}
                  </CheckboxLabel>
                </label>
              </CheckboxWrapper>
              <Deployments>
                {camera.deployments.map((deployment) => {
                  const depChecked = activeDeps === null || 
                                    activeDeps.includes(deployment._id);
                  return (
                    <DeploymentCheckboxWrapper key={deployment._id}>
                      <label>
                        <Checkbox
                          checked={depChecked}
                          active={(depChecked && camChecked)}
                          data-filter={'deployments'}
                          data-key={'ids'}
                          data-sn={deployment._id}
                          onChange={handleCheckboxChange}
                        />
                        <CheckboxLabel
                          checked={depChecked}
                          active={(depChecked && camChecked)}
                        >
                          {deployment.name}
                        </CheckboxLabel>
                      </label>
                    </DeploymentCheckboxWrapper>
                  )
                })}
              </Deployments>
            </CameraSection>
          )
        })}
      </div>
    </Accordion>
  );
};

export default DeploymentFilter;

