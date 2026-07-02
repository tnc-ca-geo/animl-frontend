import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { selectSelectedProject } from '../projects/projectsSlice';
import { selectActiveFilters, selectAvailDeploymentFilters } from './filtersSlice';
import { selectDeploymentsSortOrder } from '../user/userSlice';
import Accordion from '../../components/Accordion';
import NoneFoundAlert from '../../components/NoneFoundAlert';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import CameraFilterSection from './CameraFilterSection';
import DeploymentSortByButton from './DeploymentSortByButton';

const HeaderRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
  paddingRight: '$2',
  borderBottom: '1px solid $border',
});

const HeaderCheckboxSlot = styled('div', {
  flex: 1,
  minWidth: 0,
  // The BulkSelectCheckbox draws its own bottom border when isHeader; the
  // wrapper owns the border here so the sort button sits on the same line.
  '& > *': {
    borderBottom: 'none !important',
  },
});

// Match the label-normalization done in CameraFilterSection so alphabetical
// order reflects what users actually see rendered.
const getCameraSortLabel = (camConfig) => {
  const last = camConfig.deployments[camConfig.deployments.length - 1];
  return last.name === 'default' ? `${camConfig._id} (default)` : last.name;
};

const DeploymentFilter = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const activeFilters = useSelector(selectActiveFilters);
  const availDeps = useSelector(selectAvailDeploymentFilters);
  const sortOrder = useSelector(selectDeploymentsSortOrder(selectedProject?._id));
  const activeDeps = activeFilters.deployments;
  const activeDepCount = activeDeps ? activeDeps.length : availDeps.options.length;
  const noneFound = selectedProject && availDeps.options.length === 0;
  const managedIds = useMemo(() => availDeps.options.map(({ _id }) => _id), [availDeps.options]);

  const sortedCameraConfigs = useMemo(() => {
    if (!selectedProject) return [];
    const configs = selectedProject.cameraConfigs;
    if (sortOrder === 'alphabetical') {
      return [...configs].sort((a, b) =>
        getCameraSortLabel(a).localeCompare(getCameraSortLabel(b), undefined, {
          sensitivity: 'base',
          numeric: true,
        }),
      );
    }
    return configs;
  }, [selectedProject, sortOrder]);

  return (
    <Accordion
      label="Deployments"
      selectedCount={activeDepCount}
      expandedDefault={false}
      expandOnHeaderClick={true}
    >
      {noneFound && <NoneFoundAlert>no deployments found</NoneFoundAlert>}
      {availDeps.options.length > 0 && (
        <>
          <HeaderRow>
            <HeaderCheckboxSlot>
              <BulkSelectCheckbox filterCat="deployments" managedIds={managedIds} isHeader={true} />
            </HeaderCheckboxSlot>
            {selectedProject && <DeploymentSortByButton projectId={selectedProject._id} />}
          </HeaderRow>
          <div>
            {sortedCameraConfigs.map((camConfig) => (
              <CameraFilterSection
                key={camConfig._id}
                camConfig={camConfig}
                activeDeps={activeDeps}
              />
            ))}
          </div>
        </>
      )}
    </Accordion>
  );
};

export default DeploymentFilter;
