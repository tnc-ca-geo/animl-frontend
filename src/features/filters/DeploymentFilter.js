import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { 
  selectActiveFilters,
  selectAvailDeployments,
} from './filtersSlice';
import { fetchCameras, selectCameras } from '../cameras/camerasSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraSection from './CameraSection';


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

  return (
    <Accordion 
      label='Deployments'
      selectedCount={selectedDepCount}
      expandedDefault={false}
    >
      <BulkSelectCheckbox
        filterCat='deployments'
        managedIds={availDeps.ids}
        showLabel={true}
      />
      <div>
        {cameras.cameras.map((camera) => (
          <CameraSection 
            key={camera._id}
            camera={camera}
            activeDeps={activeDeps}
          />
        ))}
      </div>
    </Accordion>
  );
};

export default DeploymentFilter;
