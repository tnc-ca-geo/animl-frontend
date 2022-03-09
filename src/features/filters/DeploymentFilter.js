import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject, selectSelectedView } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeployments } from './filtersSlice';
import Accordion from '../../components/Accordion';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';


const DeploymentFilter = () => {
  console.groupCollapsed('DeploymentFilter() rendering')
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);
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

  // useEffect(() => {
  //   console.log('DeploymentFilter() - selectedProject or selectedView changed!')
  //   // We want this to fire when:
  //   //    - project is set
  //   //    - view is set
  //   //    - deployments are edited
  //   //    - cameras are edited

  //   // could either figure out new filters here and dispatch them w/ setActiveFilters, 
  //   // or dispacth general "camerasChanged(newCameras)" and figure rest out in filters slice

  //   // Either way, we need to:
  //   //    - (1) update available camera and deployments with latest (that should be easy)
  //   //    - (2) figure out how to update activeFilters. 
  //   //        - if there are active filters, and the project or view gets reset, 
  //   //          we want to set activeFilters to the new selectedView's filters
  //   //        - but if the cameras changed from a deployment edit or camera edit, 
  //   //          it would be nice to preserve thes
  //   //        - active filter state and just add/remove the new cameras/deps accordingly
  //   //        - or not? does it matter if when you update a deployment/camera all 
  //   //          filters get reset the current selectedView's?


  // }, [selectedProject, selectedView]);

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

