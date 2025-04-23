import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { truncateString } from '../../app/utils.js';
import { checkboxFilterToggled, checkboxOnlyButtonClicked } from './filtersSlice.js';
import Checkbox from '../../components/Checkbox.jsx';
import BulkSelectCheckbox from './BulkSelectCheckbox.jsx';
import { CheckboxLabel } from '../../components/CheckboxLabel.jsx';
import { CheckboxWrapper } from '../../components/CheckboxWrapper.jsx';
import { ChevronRightIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import IconButton from '../../components/IconButton.jsx';
import { selectGlobalBreakpoint } from '../projects/projectsSlice.js';

const AdditionalDepCount = styled('div', {
  fontStyle: 'italic',
  variants: {
    active: {
      true: {
        color: '$hiContrast',
      },
      false: {
        color: '$textMedium',
      },
    },
  },
});

const Deployments = styled('div', {
  marginLeft: '6px',
  borderLeft: '1px solid $border',
});

const CameraCheckboxWrapper = styled(CheckboxWrapper, {
  // paddingBottom: '$1',
});

const ExpandButton = styled('div', {
  position: 'absolute',
  right: '0',
});

const DeploymentCheckboxWrapper = styled(CheckboxWrapper, {
  marginLeft: '$3',
});

const StyledCameraFilterSection = styled('div', {
  fontSize: '$3',
  position: 'relative',
});

const CameraFilterSection = ({ camConfig, activeDeps }) => {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  // format default deployment names
  const deployments = camConfig.deployments.map((dep) => {
    const name = dep.name === 'default' ? `${camConfig._id} (default)` : dep.name;
    return { ...dep, name };
  });

  const managedIds = deployments.map((dep) => dep._id);

  const handleCheckboxChange = (e) => {
    dispatch(
      checkboxFilterToggled({
        filterCat: e.target.dataset.filterCat,
        val: e.target.dataset.sn,
      }),
    );
  };

  const handleExpandCameraButtonClick = (e) => {
    e.preventDefault();
    setExpanded(!expanded);
  };

  return (
    <StyledCameraFilterSection>
      <CameraCheckboxWrapper>
        <label>
          <BulkSelectCheckbox filterCat="deployments" managedIds={managedIds} isHeader={false} />
          <CameraCheckboxLabel
            filterCat="deployments"
            managedIds={managedIds}
            deployments={deployments}
            activeDeps={activeDeps}
          />
          <ExpandButton onClick={handleExpandCameraButtonClick}>
            <IconButton size="small" variant="ghost">
              {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </IconButton>
          </ExpandButton>
        </label>
      </CameraCheckboxWrapper>
      {expanded && (
        <Deployments>
          {deployments.map((dep) => {
            const depChecked = activeDeps === null || activeDeps.includes(dep._id);
            return (
              <DeploymentCheckboxWrapper key={dep._id}>
                <label>
                  <Checkbox
                    checked={depChecked}
                    active={depChecked}
                    data-filter-cat={'deployments'}
                    data-sn={dep._id}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel checked={depChecked} active={depChecked}>
                    {truncateString(dep.name, 27)}
                  </CheckboxLabel>
                </label>
              </DeploymentCheckboxWrapper>
            );
          })}
        </Deployments>
      )}
    </StyledCameraFilterSection>
  );
};

const OnlyButton = styled('div', {
  position: 'absolute',
  right: '32px',
  background: '$gray3',
  padding: '$0 $2',
  fontWeight: '$5',
  '&:hover': {
    textDecoration: 'underline',
  },
  variants: {
    hover: {
      true: {
        display: 'unset',
      },
    },
  },
  display: 'none',
  marginLeft: 'auto',
  '@bp1': {
    marginLeft: 'unset',
  },
});

const CameraCheckboxLabel = ({ filterCat, managedIds, deployments, activeDeps }) => {
  const [showOnlyButton, setShowOnlyButton] = useState(false);
  const dispatch = useDispatch();

  const mostRecentDep = truncateString(deployments[deployments.length - 1].name, 27);

  let mostRecentActiveDep = '';
  for (const dep of deployments) {
    if ((activeDeps && activeDeps.includes(dep._id)) || activeDeps === null) {
      mostRecentActiveDep = truncateString(dep.name, 27);
    }
  }

  let activeDepCount = deployments.length;
  if (activeDeps !== null) {
    activeDepCount = deployments.filter((dep) => activeDeps.includes(dep._id)).length;
  }

  const someActive = activeDepCount > 0;

  const inactiveDepCount = deployments.length - activeDepCount;

  const handleOnlyButtonClick = (e) => {
    e.preventDefault();
    dispatch(checkboxOnlyButtonClicked({ filterCat, managedIds }));
  };

  const globalBreakpoint = useSelector(selectGlobalBreakpoint);
  const alwaysShowOnly = globalBreakpoint === 'xs' || globalBreakpoint === 'xxs';

  return (
    <CheckboxLabel
      active={someActive}
      onMouseEnter={() => setShowOnlyButton(true)}
      onMouseLeave={() => setShowOnlyButton(false)}
    >
      <div>{someActive ? mostRecentActiveDep : mostRecentDep}</div>
      <AdditionalDepCount active={true}>
        {someActive && activeDepCount - 1 > 0 && `, +${activeDepCount - 1}`}
      </AdditionalDepCount>
      <AdditionalDepCount active={false}>
        {!someActive && inactiveDepCount - 1 > 0 && `, +${inactiveDepCount - 1}`}
        {someActive && inactiveDepCount > 0 && `, +${inactiveDepCount}`}
      </AdditionalDepCount>
      <OnlyButton onClick={handleOnlyButtonClick} hover={alwaysShowOnly || showOnlyButton}>
        only
      </OnlyButton>
    </CheckboxLabel>
  );
};

export default CameraFilterSection;
