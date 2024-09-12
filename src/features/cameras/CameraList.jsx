import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { selectUserCurrentRoles } from '../auth/authSlice';
import { unregisterCamera } from './wirelessCamerasSlice';
import { setModalContent, setSelectedCamera } from '../projects/projectsSlice.js';
import Accordion from '../../components/Accordion';
import IconButton from '../../components/IconButton';
import { Cross2Icon, Pencil1Icon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import { StandAloneInput as Input } from '../../components/Form';

import {
  hasRole,
  WRITE_CAMERA_REGISTRATION_ROLES,
  WRITE_CAMERA_SERIAL_NUMBER_ROLES,
  WRITE_DEPLOYMENTS_ROLES,
} from '../auth/roles';

const StyledCameraList = styled('div', {
  border: '1px solid $border',
  borderBottom: 'none',
  maxHeight: '50vh',
  overflowY: 'scroll',
});

const DepButtons = styled('div', {
  minWidth: '50px',
  placeSelf: 'end',
});

const DateDash = styled('span', {
  paddingLeft: '$2',
  paddingRight: '$2',
});

const Date = styled('span', {
  width: '120px',
  variants: {
    type: {
      start: {
        textAlign: 'right',
      },
      end: {
        textAlign: 'left',
      },
    },
  },
});

const Bookend = styled('span', {
  fontStyle: 'italic',
  color: '$textMedium',
});

const DepDates = styled('div', {
  placeSelf: 'center',
  display: 'flex',
  alignItems: 'center',
  color: '$textDark',
});

const DepName = styled('div', {
  display: 'flex',
  alignItems: 'center',
  width: 210,
});

const DeploymentItem = styled('div', {
  fontSize: '$3',
  marginLeft: '$5',
  display: 'grid',
  gridTemplateColumns: 'auto auto auto',
  alignContent: 'center',
  color: '$textDark',
  '&:not(:last-child)': {
    borderBottom: '1px solid $gray6',
  },
});

const StyledActiveState = styled('div', {
  fontSize: '$3',
  padding: '$0 $2',
  paddingBottom: '1px',
  borderRadius: '$3',
  border: '1px solid $border',
  variants: {
    active: {
      true: {
        color: '$successText',
        backgroundColor: '$successBg',
        borderColor: '$successBorder',
      },
      false: {
        color: '$textMedium',
        backgroundColor: '$backgroundDark',
      },
    },
  },
});

const StyledDropdownMenuTrigger = styled(DropdownMenuTrigger, {
  marginLeft: 'auto',
});

const StyledDropdownMenuContent = styled(DropdownMenuContent, {
  minWidth: '100px',
});

const CameraFilter = styled('div', {
  display: 'flex',
  marginBottom: '$3',
});

const ActiveState = ({ active }) => (
  <StyledActiveState active={active.toString()}>{active ? 'active' : 'inactive'}</StyledActiveState>
);

const CameraList = ({ cameras, handleSaveDepClick, handleDeleteDepClick }) => {
  const userRoles = useSelector(selectUserCurrentRoles);
  const dispatch = useDispatch();

  const handleUnregisterClick = (cameraId) => {
    dispatch(unregisterCamera(cameraId));
  };

  const handleEditSerialNumberClick = ({ cameraId }) => {
    dispatch(setModalContent('update-serial-number-form'));
    dispatch(setSelectedCamera(cameraId));
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [cameraFilter, setCameraFilter] = useState('');

  return (
    <>
      {cameras.length > 0 && (
        <>
          <CameraFilter>
            <Input
              css={{ width: 320, height: 40, padding: '$0 $3', marginRight: '$3' }}
              placeholder="Filter by Camera Serial Number or Deployment..."
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
            />
          </CameraFilter>

          <StyledCameraList>
            {cameras.map((cam) => {
              if (
                cam._id.toString().toLowerCase().includes(cameraFilter.toLowerCase()) ||
                cam.deployments.some((dep) => dep.name.includes(cameraFilter))
              ) {
                return (
                  <Accordion
                    key={cam._id}
                    label={cam._id}
                    boldLabel={true}
                    expandedDefault={true}
                    headerButtons={
                      <>
                        {cam.isWireless && <ActiveState active={cam.active} />}
                        <DropdownMenu open={dropdownOpen === cam._id}>
                          <StyledDropdownMenuTrigger
                            onClick={() => setDropdownOpen(cam._id)}
                            asChild
                          >
                            <IconButton variant="ghost">
                              <DotsHorizontalIcon />
                            </IconButton>
                          </StyledDropdownMenuTrigger>
                          <StyledDropdownMenuContent
                            sideOffset={5}
                            onInteractOutside={() => setDropdownOpen(null)}
                          >
                            {hasRole(userRoles, WRITE_DEPLOYMENTS_ROLES) && (
                              <DropdownMenuItem
                                onClick={() => handleSaveDepClick({ cameraId: cam._id })}
                              >
                                Add Deployment
                              </DropdownMenuItem>
                            )}
                            {hasRole(userRoles, WRITE_CAMERA_SERIAL_NUMBER_ROLES) && (
                              <Tooltip open={tooltipOpen}>
                                <TooltipTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      handleEditSerialNumberClick({ cameraId: cam._id })
                                    }
                                    onClick={() => cam.isWireless && setTooltipOpen(true)}
                                    onMouseLeave={() => setTooltipOpen(false)}
                                    disabled={cam.isWireless}
                                  >
                                    Edit camera serial number
                                  </DropdownMenuItem>
                                </TooltipTrigger>
                                <TooltipContent side="left" sideOffset={5}>
                                  You cannot edit the serial number of a wireless camera
                                  <TooltipArrow />
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && cam.active && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation;
                                  handleUnregisterClick({
                                    cameraId: cam._id,
                                  });
                                }}
                              >
                                Release camera
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuArrow offset={12} />
                          </StyledDropdownMenuContent>
                        </DropdownMenu>
                      </>
                    }
                  >
                    {cam.deployments.map((dep) => (
                      <DeploymentItem key={dep._id}>
                        <DepName>
                          {dep.name === 'default' ? `${cam._id} (default)` : dep.name}
                        </DepName>
                        <DepDates>
                          <Date type="start">
                            {dep.startDate ? (
                              format(dep.startDate)
                            ) : (
                              <Bookend>dawn of time</Bookend>
                            )}
                          </Date>
                          <DateDash>-</DateDash>
                          <Date type="end">
                            {dep.endDate ? format(dep.endDate) : <Bookend>today</Bookend>}
                          </Date>
                        </DepDates>
                        {hasRole(userRoles, WRITE_DEPLOYMENTS_ROLES) && (
                          <DepButtons>
                            <IconButton
                              variant="ghost"
                              size="small"
                              onClick={() =>
                                handleSaveDepClick({
                                  cameraId: cam._id,
                                  deployment: dep,
                                })
                              }
                              disabled={dep.editable === false}
                            >
                              <Pencil1Icon />
                            </IconButton>
                            <IconButton
                              variant="ghost"
                              size="small"
                              onClick={() =>
                                handleDeleteDepClick({
                                  cameraId: cam._id,
                                  deployment: dep,
                                })
                              }
                              disabled={dep.editable === false}
                            >
                              <Cross2Icon />
                            </IconButton>
                          </DepButtons>
                        )}
                      </DeploymentItem>
                    ))}
                  </Accordion>
                );
              }
            })}
          </StyledCameraList>
        </>
      )}
    </>
  );
};

function format(date) {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT);
}

export default CameraList;
