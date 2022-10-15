import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { truncateString } from '../../app/utils';
import { checkboxFilterToggled, checkboxOnlyButtonClicked } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

const AdditionalActiveDepCount = styled('div', {
  fontStyle: 'italic',
});

const ActiveDepLabel = styled('div', {

});

const CameraId = styled('span', {
  // color: '$gray600',
});

const Deployments = styled('div', {
  marginLeft: '$2',
  borderLeft: '1px solid $gray400',
});

const CameraCheckboxWrapper = styled(CheckboxWrapper, {
  // paddingBottom: '$1',
})

const ExpandButton = styled('div', {
  paddingRight: '$2',
  position: 'absolute',
  right: '0',
})

const DeploymentCheckboxWrapper = styled(CheckboxWrapper, {
  marginLeft: '$3',
});

const StyledCameraFilterSection = styled('div', {
  fontSize: '$3',
});

const CameraFilterSection = ({ camConfig, activeDeps }) => {
  const [expanded, setExpanded] = useState(false);
  // const [mostRecentActiveDep, setMostRecentActiveDep] = useState();
  // const [activeDepCount, setActiveDepCount] = useState();
  const dispatch = useDispatch();

  // format default deployment names
  const deployments = camConfig.deployments.map((dep) => {
    const name = dep.name === 'default' 
      ? `${camConfig._id} (default)` 
      : dep.name;
    return { ...dep, name };
  })

  // useEffect(() => {
  //   // get most recent active deployment name
  //   let depName = '';
  //   for (const dep of deployments) {
  //     if ((activeDeps && activeDeps.includes(dep._id)) || 
  //         activeDeps === null) {
  //       depName = dep.name;
  //     }
  //   }
  //   depName = truncateString(depName, 27);
  //   setMostRecentActiveDep(depName);
    
  //   // get active deplployment count
  //   let actDepCount = deployments.length;
  //   if (activeDeps !== null) {
  //     actDepCount = deployments.filter((dep) => (
  //       activeDeps.includes(dep._id)
  //     )).length;
  //   }
  //   setActiveDepCount(actDepCount);
  // }, [ deployments, activeDeps ]);

  let mostRecentActiveDep = '';
  // let depName = '';
  for (const dep of deployments) {
    if ((activeDeps && activeDeps.includes(dep._id)) || 
        activeDeps === null) {
      mostRecentActiveDep = truncateString(dep.name, 27);
    }
  }

  let activeDepCount = deployments.length;
  if (activeDeps !== null) {
    activeDepCount = deployments.filter((dep) => (
      activeDeps.includes(dep._id)
    )).length;
  }

  const handleCheckboxChange = (e) => {
    dispatch(checkboxFilterToggled({
      filterCat: e.target.dataset.filterCat,
      val: e.target.dataset.sn,
    }));
  };

  const handleExpandCameraButtonClick = () => setExpanded(!expanded);

  return (
    <StyledCameraFilterSection>
      <CameraCheckboxWrapper>
        <label>
          <BulkSelectCheckbox
            filterCat='deployments'
            managedIds={deployments.map((dep) => dep._id)}
            showLabel={false}
          />
          <CameraCheckboxLabel 
            filterCat='deployments'
            managedIds={deployments.map((dep) => dep._id)}
            activeDepCount={activeDepCount}
            mostRecentActiveDep={mostRecentActiveDep}
          />
          <ExpandButton onClick={handleExpandCameraButtonClick}>
            <IconButton size='small' variant='ghost'>
              <FontAwesomeIcon icon={ 
                expanded ? ['fas', 'angle-down'] : ['fas', 'angle-right']
              }/>
            </IconButton>
          </ExpandButton>
        </label>
      </CameraCheckboxWrapper>

      {expanded && 
        <Deployments>
          {deployments.map((dep) => {
            const depChecked = activeDeps === null || 
                              activeDeps.includes(dep._id);
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
                  <CheckboxLabel
                    checked={depChecked}
                    active={depChecked}
                  >
                    {truncateString(dep.name, 27)}
                  </CheckboxLabel>
                </label>
              </DeploymentCheckboxWrapper>
            )
          })}
        </Deployments>
      }
    </StyledCameraFilterSection>
  );
};

const OnlyButton = styled('div', {
  position: 'absolute',
  right: '32px',
  background: '$gray200',
  padding: '$0 $2',
  fontWeight: '$5',
  '&:hover': {
    textDecoration: 'underline',
  }
});

const CameraCheckboxLabel = ({
  filterCat,
  managedIds,
  activeDepCount,
  mostRecentActiveDep,
}) => {
  const [ showOnlyButton, setShowOnlyButton ] = useState(false);
  const dispatch = useDispatch();

  const handleOnlyButtonClick = (e) => {
    e.preventDefault();
    dispatch(checkboxOnlyButtonClicked({ filterCat, managedIds }));
  };

  return (
    <CheckboxLabel
      active={activeDepCount > 0}
      onMouseEnter={() => setShowOnlyButton(true)}
      onMouseLeave={() => setShowOnlyButton(false)}
    >
      <ActiveDepLabel>{mostRecentActiveDep}</ActiveDepLabel>
      <AdditionalActiveDepCount>
        {activeDepCount - 1 > 0 
            ? `, +${activeDepCount - 1}`
            : activeDepCount === 0
              ? `no deployments selected`
              : ''
        }
      </AdditionalActiveDepCount>
      {showOnlyButton &&
        <OnlyButton onClick={handleOnlyButtonClick}>only</OnlyButton>
      }
    </CheckboxLabel>
  )
}

export default CameraFilterSection;
