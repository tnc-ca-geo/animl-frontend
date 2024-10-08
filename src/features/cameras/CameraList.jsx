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
import { unregisterCamera, registerCamera } from './wirelessCamerasSlice';
import { setModalContent, setSelectedCamera } from '../projects/projectsSlice.js';
import IconButton from '../../components/IconButton';
import {
  Cross2Icon,
  Pencil1Icon,
  DotsHorizontalIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@radix-ui/react-icons';
import { StandAloneInput as Input } from '../../components/Form';
import { Camera, MapPin } from 'lucide-react';
import { indigo } from '@radix-ui/colors';

import {
  hasRole,
  WRITE_CAMERA_REGISTRATION_ROLES,
  WRITE_CAMERA_SERIAL_NUMBER_ROLES,
  WRITE_DEPLOYMENTS_ROLES,
} from '../auth/roles';

const StyledCameraList = styled('div', {
  border: '1px solid $border',
  maxHeight: '50vh',
  overflowY: 'scroll',
  borderRadius: '$1',
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
  width: 250,
});

const DeploymentItem = styled('div', {
  fontSize: '$3',
  marginLeft: '$9',
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

const NoCamerasFound = styled('div', {
  height: '$10',
  backgroundColor: '$backgroundLight',
  fontSize: '$3',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const IconKey = styled('div', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  fontSize: '$2',
  padding: '$2 $0',
  color: '$textMedium',
  svg: {
    marginLeft: '6px',
    marginRight: '4px',
  },
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

  const handleReRegisterCameraClick = ({ cameraId, make }) => {
    dispatch(registerCamera({ cameraId, make }));
  };

  const handleEditSerialNumberClick = ({ cameraId }) => {
    dispatch(setModalContent('update-serial-number-form'));
    dispatch(setSelectedCamera(cameraId));
  };

  const handleDeleteCameraClick = () => {
    dispatch(setModalContent('delete-camera-form'));
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [cameraFilter, setCameraFilter] = useState('');
  const filteredCameras = cameras.filter(
    (cam) =>
      cam._id.toString().toLowerCase().includes(cameraFilter.toLowerCase()) ||
      cam.deployments.some((dep) => dep.name.includes(cameraFilter)),
  );

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
            {filteredCameras.map((cam) => (
              <CameraItem
                key={cam._id}
                label={cam._id}
                boldLabel={true}
                expandedDefault={true}
                headerButtons={
                  <>
                    {cam.isWireless && <ActiveState active={cam.active} />}
                    <DropdownMenu open={dropdownOpen === cam._id}>
                      <StyledDropdownMenuTrigger onClick={() => setDropdownOpen(cam._id)} asChild>
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
                                onSelect={() => handleEditSerialNumberClick({ cameraId: cam._id })}
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
                        {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) &&
                          cam.isWireless &&
                          !cam.active && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation;
                                handleReRegisterCameraClick({
                                  cameraId: cam._id,
                                  make: cam.make,
                                });
                              }}
                            >
                              Re-register camera
                            </DropdownMenuItem>
                          )}
                        {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && (
                          <DropdownMenuItem
                            className=""
                            onClick={(e) => {
                              e.stopPropagation;
                              handleDeleteCameraClick({
                                cameraId: cam._id,
                              });
                            }}
                          >
                            Delete camera
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuArrow offset={12} />
                      </StyledDropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
              >
                {cam.deployments.map((dep) => {
                  let depName = dep.name === 'default' ? `${cam._id} (default)` : dep.name;
                  depName = depName.length > 23 ? `${depName.slice(0, 23)}...` : depName;
                  return (
                    <DeploymentItem key={dep._id}>
                      <DepName>
                        <MapPin size={14} style={{ marginRight: '12px' }} />
                        {depName}
                      </DepName>
                      <DepDates>
                        <Date type="start">
                          {dep.startDate ? format(dep.startDate) : <Bookend>dawn of time</Bookend>}
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
                            css={{ marginRight: '$1' }}
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
                  );
                })}
              </CameraItem>
            ))}
            {filteredCameras.length === 0 && <NoCamerasFound>No cameras found.</NoCamerasFound>}
          </StyledCameraList>
          <IconKey>
            <strong style={{ marginRight: '2px' }}>Key: </strong>
            <Camera size={14} />{' '}
            <a
              href="https://docs.animl.camera/getting-started/structure-concepts-and-terminology#cameras"
              target="_blank"
              rel="noreferrer"
            >
              Camera
            </a>
            ; <MapPin size={14} />
            <a
              href="https://docs.animl.camera/getting-started/structure-concepts-and-terminology#deployments"
              target="_blank"
              rel="noreferrer"
            >
              Deployment
            </a>
          </IconKey>
        </>
      )}
    </>
  );
};

// TODO: move to own component

export const SelectedCount = styled('span', {
  background: indigo.indigo4,
  fontSize: '$2',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $2',
  borderRadius: '$2',
});

export const Label = styled('span', {
  marginRight: '$4',

  variants: {
    bold: {
      true: {
        fontWeight: '$4',
      },
    },
  },
});

const AccordionBody = styled('div', {
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundDark',
  fontFamily: '$mono',
  '& > div': {
    padding: '$2 $3',
  },
});

const ExpandButton = styled('div', {
  marginRight: '$3',
});

const AccordionHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontWeight: '$3',
  fontFamily: '$sourceSansPro',
  height: '$7',
  borderBottom: '1px solid $border',
  color: '$textDark',
  backgroundColor: '$backgroundLight',
  padding: '$0 $2 $0 $2',
  pointerEvents: 'auto',
  position: 'relative',
});

const CameraIcon = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '12px',
  borderRadius: '50%',
});

const CameraItem = (props) => {
  const [expanded, setExpanded] = useState(props.expandedDefault);
  const expandOnHeaderClick = props.expandOnHeaderClick || false;

  const handleAccordionHeaderClick = () => {
    if (expandOnHeaderClick) {
      setExpanded(!expanded);
    }
  };

  const handleExpandButtonClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <AccordionHeader onClick={handleAccordionHeaderClick}>
        <ExpandButton onClick={handleExpandButtonClick}>
          <IconButton variant="ghost">
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </IconButton>
        </ExpandButton>

        <CameraIcon>
          <Camera size={14} />
        </CameraIcon>
        {props.label && <Label bold={props.boldLabel}>{props.label}</Label>}

        {props.headerButtons}
      </AccordionHeader>
      {expanded && <AccordionBody>{props.children}</AccordionBody>}
    </div>
  );
};

function format(date) {
  return DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT);
}

export default CameraList;
