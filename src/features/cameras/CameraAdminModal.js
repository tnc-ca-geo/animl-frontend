import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras } from './camerasSlice';
import Accordion from '../../components/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
import {
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';

const CameraList = styled.div({
  border: '$1 solid $gray400',
  borderBottom: 'none',

});

const DepButtons = styled.div({

});

const DepDates = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const DepName = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const DeploymentItem = styled.div({
  paddingTop: '$2',
  paddingBottom: '$2',
  display: 'flex',
  justifyContent: 'space-between',
  ':not(:last-child)': {
    borderBottom: '$1 solid $gray400',
  }
});


const CameraAdminModal = () => {
  const cameras = useSelector(selectCameras);
  const dispatch = useDispatch();

  const handleButtonClick = () => {

  };

  const format = (date) => moment(date, EXIF).format('MM-DD-YY');

  return (
    <div>
      <CameraList>
        {cameras.cameras.map((cam) => (
          <Accordion
            key={cam._id}
            label={cam._id}
            expandedDefault={true}
          >
            {cam.deployments.map((dep) => (
              <DeploymentItem key={dep._id}> 
                <DepName>{dep.name}</DepName>
                <DepDates>
                  {dep.startDate && format(dep.startDate)} - {dep.endDate && format(dep.endDate)}
                </DepDates>
                <DepButtons>
                  <IconButton
                    variant='ghost'
                    size='small'
                    onClick={handleButtonClick}
                  >
                    <FontAwesomeIcon icon={['fas', 'pen']}/>
                  </IconButton>
                  <IconButton
                    variant='ghost'
                    size='small'
                    onClick={handleButtonClick}
                  >
                    <FontAwesomeIcon icon={['fas', 'times']}/>
                  </IconButton>
                </DepButtons>
              </DeploymentItem>
            ))}
          </Accordion>
        ))}
      </CameraList>
    </div>
  );
};

export default CameraAdminModal;

