import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeploymentFilters } from './filtersSlice';
import Accordion from '../../components/Accordion';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';

const DeploymentFilter = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const availDeps = useSelector(selectAvailDeploymentFilters);
  const activeDeps = activeFilters.deployments;
  const activeDepCount = activeDeps ? activeDeps.length : availDeps.options.length;
  const noneFound = selectedProject && availDeps.options.length === 0;
  const managedIds = useMemo(() => availDeps.options.map(({ _id }) => _id), [availDeps.options]);


  return (
    <Accordion 
      label='Deployments'
      selectedCount={activeDepCount}
      expandedDefault={false}
    >
      {noneFound && <NoneFoundAlert>no deployments found</NoneFoundAlert>}
      {availDeps.options.length > 0 &&
        <>
          <BulkSelectCheckbox
            filterCat='deployments'
            managedIds={managedIds}
            isHeader={true}
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

