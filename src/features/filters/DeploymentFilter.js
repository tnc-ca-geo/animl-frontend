import React from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeployments } from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';


const DeploymentFilter = () => {
  console.groupCollapsed('DeploymentFilter() rendering')
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const availDeps = useSelector(selectAvailDeployments);
  const activeDeps = activeFilters.deployments;
  const activeDepCount = activeDeps ? activeDeps.length : availDeps.ids.length;
  console.log('selectedProject: ', selectedProject);
  console.log('activeFilters: ', activeFilters);
  console.log('availDeps: ', availDeps);
  console.log('activeDeps: ', activeDeps);
  console.log('activeDepCount: ', activeDepCount);
  console.groupEnd()

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
        {selectedProject && selectedProject.cameras.map((camera) => (
          <CameraFilterSection 
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

