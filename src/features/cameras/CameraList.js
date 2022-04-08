import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras, unregisterCamera } from './camerasSlice';
import Accordion from '../../components/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import {
  DATE_FORMAT_READABLE_SHORT as DFRS,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';

const StyledCameraList = styled('div', {
  border: '1px solid $gray400',
  borderBottom: 'none',
});

const ManageCamButton = styled(Button, {
  border: 'none',
  backgroundColor: '$loContrast',
  paddingLeft: '$2',
  color: '$hiContrast',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray400',
    cursor: 'pointer',
  },

  svg: {
    paddingLeft: '$2',
  }
});

const DepButtons = styled('div', {

});

const DateDash = styled('span', {
  paddingLeft: '$2',
  paddingRight: '$2',
})

const Date = styled('span', {
  width: '120px',

  variants: {
    type: {
      start: {
        textAlign: 'right',
      },
      end: {
        textAlign: 'left',
      }
    }
  }
});

const Bookend = styled('span', {
  fontStyle: 'italic',
  color: '$gray600',
});

const DepDates = styled('div', {
  display: 'flex',
  alignItems: 'center',
  // width: '210px',
});

const DepName = styled('div', {
  display: 'flex',
  alignItems: 'center',
  width: '150px',
});

const DeploymentItem = styled('div', {
  fontSize: '$3',
  paddingTop: '$2',
  paddingBottom: '$2',
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-child)': {
    borderBottom: '1px solid $gray400',
  }
});

const StyledActiveState = styled('div', {
  padding: '$0 $2',
  borderRadius: '$2',
  variants: {
    active: {
      true: {
        backgroundColor: '$green100',
        color: '$green700',
      },
      false: {
        backgroundColor: 'gainsboro',
        '&:hover': {
          backgroundColor: 'lightgray',
        },
      },
    },
  },
});

const ActiveState = ({ active }) => (
  <StyledActiveState active={active.toString()}>
    { active ? 'active' : 'inactive'}
  </StyledActiveState>
);

const CameraList = ({ cameras, handleSaveDepClick, handleDeleteDepClick }) => {
  console.log('enriched cams: ', cameras)
  const format = (date) => moment(date, EXIF).format(DFRS);
  const dispatch = useDispatch();

  const handleUnregisterClick = (cameraId) => {
    console.log('handleUnregisterClick: ', cameraId);
    dispatch(unregisterCamera(cameraId));
  };

  return (
    <div>
      {(cameras.length === 0)
        ? 'There are no cameras associated with this project'
        : <StyledCameraList>
            {cameras.map((cam) => (
              <Accordion
                key={cam._id}
                label={cam._id}
                expandedDefault={false}
                headerButtons={
                  <>
                    <ActiveState active={cam.active} />
                    <ManageCamButton
                      onClick={() => handleSaveDepClick({ cameraId: cam._id })}
                    >
                      Add deployment
                      <FontAwesomeIcon icon={['fas', 'plus']}/>
                    </ManageCamButton>
                    {cam.active && 
                      <ManageCamButton
                        onClick={() => handleUnregisterClick({ cameraId: cam._id })}
                      >
                        Release
                        <FontAwesomeIcon icon={['fas', 'times']}/>
                      </ManageCamButton>
                    }
                  </>
                }s
              >
                {cam.deployments.map((dep) => (
                  <DeploymentItem key={dep._id}> 
                    <DepName>{dep.name}</DepName>
                    <DepDates>
                      <Date type='start'>{
                        dep.startDate 
                          ? format(dep.startDate) 
                          : <Bookend>dawn of time</Bookend>
                      }</Date>
                      <DateDash>-</DateDash>
                      <Date type='end'>{
                        dep.endDate 
                        ? format(dep.endDate) 
                        : <Bookend>today</Bookend>
                      }</Date>
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
      }
    </div>
  );
};

export default CameraList;

