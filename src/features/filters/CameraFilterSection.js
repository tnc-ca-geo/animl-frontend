import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { truncateString } from '../../app/utils';
import { checkboxFilterToggled } from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import BulkSelectCheckbox from './BulkSelectCheckbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

const AdditionalActiveDepCount = styled('span', {
  fontStyle: 'italic',
});

const ActiveDepLabel = styled('span', {

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
  const [mostRecentActiveDep, setMostRecentActiveDep] = useState();
  const [activeDepCount, setActiveDepCount] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    // get most recent active deployment name
    let depName = '';
    for (const dep of camConfig.deployments) {
      if ((activeDeps && activeDeps.includes(dep._id)) || 
          activeDeps === null) {
        depName = dep.name;
      }
    }
    depName = truncateString(depName, 16);
    setMostRecentActiveDep(depName);
    
    // get active deplployment count
    let actDepCount = camConfig.deployments.length;
    if (activeDeps !== null) {
      actDepCount = camConfig.deployments.filter((dep) => (
        activeDeps.includes(dep._id)
      )).length;
    }
    setActiveDepCount(actDepCount);
  }, [ camConfig, activeDeps ])

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
            managedIds={camConfig.deployments.map((dep) => dep._id)}
            showLabel={false}
          />
          <CheckboxLabel
            active={activeDepCount > 0}>
            <CameraId>{camConfig._id}</CameraId>
            <ActiveDepLabel>{` - ${mostRecentActiveDep}`}</ActiveDepLabel>
            <AdditionalActiveDepCount>
              {activeDepCount - 1 > 0 
                  ? `, +${activeDepCount - 1}`
                  : activeDepCount === 0
                    ? `no deployments selected`
                    : ''
              }
            </AdditionalActiveDepCount>
          </CheckboxLabel>
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
          {camConfig.deployments.map((deployment) => {
            const depChecked = activeDeps === null || 
                              activeDeps.includes(deployment._id);
            return (
              <DeploymentCheckboxWrapper key={deployment._id}>
                <label>
                  <Checkbox
                    checked={depChecked}
                    active={depChecked}
                    data-filter-cat={'deployments'}
                    data-sn={deployment._id}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel
                    checked={depChecked}
                    active={depChecked}
                  >
                    {deployment.name}
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

export default CameraFilterSection;
