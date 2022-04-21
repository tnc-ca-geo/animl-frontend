import React from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeployments } from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';


const DeploymentFilter = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const availDeps = useSelector(selectAvailDeployments);
  const activeDeps = activeFilters.deployments;
  const activeDepCount = activeDeps ? activeDeps.length : availDeps.ids.length;

  return (
    <Accordion 
      label='Deployments'
      selectedCount={activeDepCount}
      expandedDefault={false}
    >
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
    </Accordion>
  );
};

export default DeploymentFilter;

