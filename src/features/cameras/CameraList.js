import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras } from './camerasSlice';
import Accordion from '../../components/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import {
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';

const StyledCameraList = styled('div', {
  border: '1px solid $gray400',
  borderBottom: 'none',
});

const DepButtons = styled('div', {

});

const DateDash = styled('span', {
  paddingLeft: '15px',
  paddingRight: '15px',
})

const Date = styled('span', {
  width: '80px',
})

const DepDates = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const DepName = styled('div', {
  display: 'flex',
  alignItems: 'center',
});

const DeploymentItem = styled('div', {
  paddingTop: '$2',
  paddingBottom: '$2',
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-child)': {
    borderBottom: '1px solid $gray400',
  }
});

const AddDeploymentButton = (props) => {
  const { handleSaveDepClick, cameraId } = props;
  return (
    <IconButton
      variant='ghost'
      size='small'
      onClick={() => handleSaveDepClick({cameraId})}
    >
      <FontAwesomeIcon icon={['fas', 'plus']}/>
    </IconButton>
  )
};

const CameraList = ({ cameras, handleSaveDepClick, handleDeleteDepClick }) => {
  const format = (date) => moment(date, EXIF).format('MM-DD-YY');

  return (
    <div>
      <StyledCameraList>
        {cameras.cameras.map((cam) => (
          <Accordion
            key={cam._id}
            label={cam._id}
            expandedDefault={false}
            headerButtons={
              <AddDeploymentButton
                handleSaveDepClick={handleSaveDepClick}
                cameraId={cam._id}
              />
            }
          >
            {cam.deployments.map((dep) => (
              <DeploymentItem key={dep._id}> 
                <DepName>{dep.name}</DepName>
                <DepDates>
                  <Date>{dep.startDate && format(dep.startDate)}</Date>
                  <DateDash>-</DateDash>
                  <Date>{dep.endDate && format(dep.endDate)}</Date>
                </DepDates>
                <DepButtons>
                  <IconButton
                    variant='ghost'
                    size='small'
                    onClick={() => handleSaveDepClick({
                      cameraId: cam._id,
                      deployment: dep,
                    })}
                    disabled={dep.editable === false}
                  >
                    <FontAwesomeIcon icon={['fas', 'pen']}/>
                  </IconButton>
                  <IconButton
                    variant='ghost'
                    size='small'
                    onClick={() => handleDeleteDepClick({
                      cameraId: cam._id,
                      deployment: dep,
                    })}
                    disabled={dep.editable === false}
                  >
                    <FontAwesomeIcon icon={['fas', 'times']}/>
                  </IconButton>
                </DepButtons>
              </DeploymentItem>
            ))}
          </Accordion>
        ))}
      </StyledCameraList>
    </div>
  );
};

export default CameraList;

