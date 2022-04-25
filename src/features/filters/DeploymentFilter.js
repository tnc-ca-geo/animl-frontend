import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedProject } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeployments } from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';


const NoneFoundAlert = styled('div', {
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray600',
});


const DeploymentFilter = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const availDeps = useSelector(selectAvailDeployments);
  const activeDeps = activeFilters.deployments;
  const activeDepCount = activeDeps ? activeDeps.length : availDeps.ids.length;
  const noneFound = selectedProject && availDeps.ids.length === 0;

  return (
    <Accordion 
      label='Deployments'
      selectedCount={activeDepCount}
      expandedDefault={false}
    >
      {noneFound && <NoneFoundAlert>no deployments found</NoneFoundAlert>}
      {availDeps.ids.length > 0 &&
        <>
          <BulkSelectCheckbox
            filterCat='deployments'
            managedIds={availDeps.ids}
            showLabel={true}
          />
          <div>
            {selectedProject && selectedProject.cameraConfigs.map((camConfig) => (
              <CameraFilterSection 
                key={camConfig._id}
                camConfig={camConfig}
                activeDeps={activeDeps}
              />
            ))}
          </div>
        </>
      }
    </Accordion>
  );
};

export default DeploymentFilter;

