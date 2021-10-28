import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { 
  checkboxFilterToggled,
} from './filtersSlice';
import Checkbox from '../../components/Checkbox';
import { CheckboxLabel } from '../../components/CheckboxLabel';
import { CheckboxWrapper } from '../../components/CheckboxWrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';

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

const StyledCameraSection = styled('div', {
  // fontFamily: '$mono',
  fontSize: '$3',
  // '&:nth-child(odd)': {
  //   backgroundColor: '$loContrast',
  // }
});

const CameraSection = ({ camera, activeCams, activeDeps }) => {
  const camChecked = activeCams === null || activeCams.includes(camera._id);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    // TODO: behave like bulk select, but only on the camera's own deployments
    dispatch(checkboxFilterToggled({
      filter: e.target.dataset.filter,
      key: e.target.dataset.key,
      val: e.target.dataset.sn,
    }));
  };

  const handleExpandCameraButtonClick = () => {
    // todo: expand camera section
    setExpanded(!expanded);
  };


  return (
    <StyledCameraSection>
      <CameraCheckboxWrapper>
        <label>
          <Checkbox
            checked={camChecked}
            active={camChecked}
            data-filter={'cameras'}
            data-key={'ids'}
            data-sn={camera._id}
            onChange={handleCheckboxChange}
          />
          <CheckboxLabel checked={camChecked} active={camChecked}>
            {/*{camera.make} - {camera._id}*/}
            {camera._id} - {camera.deployments[camera.deployments.length - 1].name}
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
          {camera.deployments.map((deployment) => {
            const depChecked = activeDeps === null || 
                              activeDeps.includes(deployment._id);
            return (
              <DeploymentCheckboxWrapper key={deployment._id}>
                <label>
                  <Checkbox
                    checked={depChecked}
                    active={(depChecked && camChecked)}
                    data-filter={'deployments'}
                    data-key={'ids'}
                    data-sn={deployment._id}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel
                    checked={depChecked}
                    active={(depChecked && camChecked)}
                  >
                    {deployment.name}
                  </CheckboxLabel>
                </label>
              </DeploymentCheckboxWrapper>
            )
          })}
        </Deployments>
      }
    </StyledCameraSection>
  );
};

export default CameraSection;
