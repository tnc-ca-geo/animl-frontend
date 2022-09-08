import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { styled } from '../../theme/stitches.config';
import { green } from '@radix-ui/colors';
import { selectUserCurrentRoles } from '../user/userSlice';
import { unregisterCamera, selectCamerasLoading } from './camerasSlice';
import Accordion from '../../components/Accordion';
import IconButton from '../../components/IconButton';
import { Cross2Icon, Pencil1Icon } from '@radix-ui/react-icons';
import {
  DATE_FORMAT_READABLE_SHORT as DFRS,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';
import {
  hasRole,
  WRITE_CAMERA_REGISTRATION_ROLES,
  WRITE_DEPLOYMENTS_ROLES
} from '../../auth/roles';


const StyledCameraList = styled('div', {
  border: '1px solid $gray400',
  borderBottom: 'none',
  maxHeight: '50vh',
  overflowY: 'scroll',
});

const ManageCamButtons = styled('div', {
  position: 'absolute',
  right: '$3',
})

const ManageCamButton = styled('button', {
  border: 'none',
  backgroundColor: '$gray300',
  borderRadius: '$3',
  padding: '$1 $3',
  color: '$gray600',
  marginLeft: '$2',
  textTransform: 'uppercase',
  fontSize: '$2',
  fontWeight: '600',
  '&:hover': {
    color: '$hiContrast',
    backgroundColor: '$gray400',
    cursor: 'pointer',
  },
  '&:active': {
    backgroundColor: '$gray500',
  },
});

const DepButtons = styled('div', {});

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
  borderRadius: '$1',
  variants: {
    active: {
      true: {
        color: green.green11,
        backgroundColor: green.green4,
      },
      false: {
        color: '$gray600',
        backgroundColor: '$gray200',
      },
    },
  },
});

const NoneFoundAlert = styled('div', {
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray600',
});


const ActiveState = ({ active }) => (
  <StyledActiveState active={active.toString()}>
    { active ? 'active' : 'inactive'}
  </StyledActiveState>
);


const CameraList = ({ cameras, handleSaveDepClick, handleDeleteDepClick }) => {
  const camerasLoading = useSelector(selectCamerasLoading);
  const userRoles = useSelector(selectUserCurrentRoles);
  const dispatch = useDispatch();

  const handleUnregisterClick = (cameraId) => {
    dispatch(unregisterCamera(cameraId));
  };
  
  return (
    <>
      {camerasLoading.noneFound && 
        <NoneFoundAlert>
          There are currently no cameras associated with this project.
        </NoneFoundAlert>
      }
      {cameras.length > 0 &&
        <StyledCameraList>
          {cameras.map((cam) => (
            <Accordion
              key={cam._id}
              label={cam._id}
              expandedDefault={false}
              headerButtons={
                <>
                  <ActiveState active={cam.active} />
                  <ManageCamButtons>
                    {(hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && 
                      cam.active) && 
                      <ManageCamButton
                        onClick={() => handleUnregisterClick({
                          cameraId: cam._id 
                        })}
                      >
                        Release
                      </ManageCamButton>
                    }
                    {hasRole(userRoles, WRITE_DEPLOYMENTS_ROLES) && 
                      <ManageCamButton
                        onClick={() => handleSaveDepClick({ cameraId: cam._id })}
                      >
                        Add deployment
                      </ManageCamButton>
                    }
                  </ManageCamButtons>
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
                  {hasRole(userRoles, WRITE_DEPLOYMENTS_ROLES) && 
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
                        <Pencil1Icon/>
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
                        <Cross2Icon/>
                      </IconButton>
                    </DepButtons>
                  }
                </DeploymentItem>
              ))}
            </Accordion>
          ))}
        </StyledCameraList>
      }
    </>
  );
};

function format(date) {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT);
}

export default CameraList;

