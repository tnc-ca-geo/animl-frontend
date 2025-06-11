import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLeft,
  DropdownMenuArrow,
} from '../../components/Dropdown.jsx';
import {
  Tooltip,
  TooltipContent,
  TooltipArrow,
  TooltipTrigger,
} from '../../components/Tooltip.jsx';
import { selectUserCurrentRoles } from '../auth/authSlice';
import {
  unregisterCamera,
  registerCamera,
  setDeleteCameraAlertStatus,
} from './wirelessCamerasSlice';
import {
  selectGlobalBreakpoint,
  selectSelectedProjectId,
  setModalContent,
  setSelectedCamera,
} from '../projects/projectsSlice.js';
import IconButton from '../../components/IconButton';
import { DotsHorizontalIcon, ChevronRightIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { StandAloneInput as Input } from '../../components/Form';
import { Camera, MapPin, IdCard, Trash2, Unlink, Link } from 'lucide-react';
import { indigo } from '@radix-ui/colors';

import {
  hasRole,
  WRITE_CAMERA_REGISTRATION_ROLES,
  WRITE_CAMERA_SERIAL_NUMBER_ROLES,
  WRITE_DEPLOYMENTS_ROLES,
} from '../auth/roles';
import DeleteCameraAlert from './DeleteCameraAlert.jsx';
import { globalBreakpoints } from '../../config.js';
import { DeploymentItem } from './DeploymentItem.jsx';

const StyledCameraList = styled('div', {
  border: '1px solid $border',
  maxHeight: '50vh',
  overflowY: 'scroll',
  borderRadius: '$1',
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
  const selectedProjectId = useSelector(selectSelectedProjectId);
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

  const handleDeleteCameraClick = ({ cameraId }) => {
    dispatch(setDeleteCameraAlertStatus({ isOpen: true }));
    dispatch(setSelectedCamera(cameraId));
  };

  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [editSnTooltipOpen, setEditSnTooltipOpen] = useState(false);
  const [deleteCamTooltipOpen, setDeleteCamTooltipOpen] = useState(false);
  const [releaseCamTooltipOpen, setReleaseCamTooltipOpen] = useState(false);

  const [cameraFilter, setCameraFilter] = useState('');
  const filteredCameras = cameras.filter(
    (cam) =>
      cam._id.toString().toLowerCase().includes(cameraFilter.toLowerCase()) ||
      cam.deployments.some((dep) => dep.name.includes(cameraFilter)),
  );

  const currentBreakpoint = useSelector(selectGlobalBreakpoint);
  const isSmallScreen = globalBreakpoints.lessThanOrEqual(currentBreakpoint, 'xs');

  const inputCss = isSmallScreen
    ? {
        width: '100%',
        height: 40,
        padding: '$0 $3',
      }
    : {
        width: 320,
        height: 40,
        padding: '$0 $3',
        marginRight: '$3',
      };

  return (
    <>
      {cameras.length > 0 && (
        <>
          <CameraFilter>
            <Input
              css={inputCss}
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
                            onSelect={() => handleSaveDepClick({ cameraId: cam._id })}
                          >
                            <DropdownMenuItemIconLeft>
                              <MapPin size={15} />
                            </DropdownMenuItemIconLeft>
                            Add Deployment
                          </DropdownMenuItem>
                        )}
                        {hasRole(userRoles, WRITE_CAMERA_SERIAL_NUMBER_ROLES) && (
                          <Tooltip open={editSnTooltipOpen}>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem
                                onSelect={() => handleEditSerialNumberClick({ cameraId: cam._id })}
                                onClick={() => cam.isWireless && setEditSnTooltipOpen(true)}
                                onMouseLeave={() => setEditSnTooltipOpen(false)}
                                disabled={cam.isWireless}
                              >
                                <DropdownMenuItemIconLeft>
                                  <IdCard size={15} />
                                </DropdownMenuItemIconLeft>
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
                          <Tooltip open={releaseCamTooltipOpen}>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem
                                disabled={cam.isWireless && selectedProjectId === 'default_project'}
                                onClick={() => {
                                  if (cam.isWireless && selectedProjectId === 'default_project') {
                                    setReleaseCamTooltipOpen(true);
                                  }
                                }}
                                onMouseLeave={() => setReleaseCamTooltipOpen(false)}
                                onSelect={(e) => {
                                  e.stopPropagation;
                                  handleUnregisterClick({
                                    cameraId: cam._id,
                                  });
                                }}
                              >
                                <DropdownMenuItemIconLeft>
                                  <Unlink size={15} />
                                </DropdownMenuItemIconLeft>
                                Release camera
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent side="left" sideOffset={5}>
                              You cannot release wireless cameras from the Default Project
                              <TooltipArrow />
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) &&
                          cam.isWireless &&
                          !cam.active && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.stopPropagation;
                                handleReRegisterCameraClick({
                                  cameraId: cam._id,
                                  make: cam.make,
                                });
                              }}
                            >
                              <DropdownMenuItemIconLeft>
                                <Link size={15} />
                              </DropdownMenuItemIconLeft>
                              Re-register camera
                            </DropdownMenuItem>
                          )}
                        {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && (
                          <Tooltip open={deleteCamTooltipOpen}>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem
                                disabled={cam.isWireless && selectedProjectId === 'default_project'}
                                onClick={() => {
                                  if (cam.isWireless && selectedProjectId === 'default_project') {
                                    setDeleteCamTooltipOpen(true);
                                  }
                                }}
                                onMouseLeave={() => setDeleteCamTooltipOpen(false)}
                                onSelect={(e) => {
                                  e.stopPropagation;
                                  handleDeleteCameraClick({
                                    cameraId: cam._id,
                                  });
                                }}
                              >
                                <DropdownMenuItemIconLeft>
                                  <Trash2 size={15} />
                                </DropdownMenuItemIconLeft>
                                Delete camera
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent side="left" sideOffset={5}>
                              You cannot delete wireless cameras from the Default Project
                              <TooltipArrow />
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <DropdownMenuArrow offset={12} />
                      </StyledDropdownMenuContent>
                    </DropdownMenu>
                  </>
                }
              >
                {cam.deployments.map((dep) => (
                  <DeploymentItem
                    key={dep._id}
                    deployment={dep}
                    cameraId={cam._id}
                    handleDelete={handleDeleteDepClick}
                    handleSave={handleSaveDepClick}
                  />
                ))}
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
          <DeleteCameraAlert />
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

export default CameraList;
