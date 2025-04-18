import React, { useEffect, useState } from 'react';
import { styled } from '@stitches/react';
import { mauve } from '@radix-ui/colors';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { selectUserCurrentRoles } from '../auth/authSlice';
import { hasRole, WRITE_CAMERA_REGISTRATION_ROLES } from '../auth/roles';
import {
  selectWirelessCamerasLoading,
  selectWirelessCameras,
  fetchWirelessCameras,
} from './wirelessCamerasSlice';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
import DeleteDeploymentForm from './DeleteDeploymentForm';
import RegisterCameraForm from './RegisterCameraForm';
import { selectSelectedProject } from '../projects/projectsSlice';
import { enrichCameraConfigs } from '../tasks/utils';

const Separator = styled('div', {
  width: '100%',
  height: '1px',
  backgroundColor: mauve.mauve6,
  margin: '$3 0',
});

const CameraAdminModal = () => {
  const project = useSelector(selectSelectedProject);
  const userRoles = useSelector(selectUserCurrentRoles);
  const [showSaveDepForm, setShowSaveDepForm] = useState(false);
  const [showDeleteDepForm, setShowDeleteDepForm] = useState(false);
  const [cameraSelected, setCameraSelected] = useState();
  const [deploymentSelected, setDeploymentSelected] = useState();
  const dispatch = useDispatch();

  // fetch wireless camera records
  const wirelessCams = useSelector(selectWirelessCameras);
  const camerasLoading = useSelector(selectWirelessCamerasLoading);
  useEffect(() => {
    const { isLoading, noneFound } = camerasLoading;
    if (!wirelessCams.length && !isLoading && !noneFound) {
      dispatch(fetchWirelessCameras());
    }
  }, [wirelessCams.length, camerasLoading, dispatch]);

  // enrich camera config records with wireless camera data
  const cameraConfigs = _.cloneDeep(project.cameraConfigs);
  const enrichedCams = enrichCameraConfigs(cameraConfigs).map((camConfig) => {
    const camera = { ...camConfig };
    if (wirelessCams.length > 0) {
      const wirelessCam = wirelessCams.find((cam) => cam._id === camConfig._id);
      if (wirelessCam) {
        camera.isWireless = true;
        camera.make = wirelessCam.make;
        const active = wirelessCam.projRegistrations.some(
          (pr) => pr.projectId === project._id && pr.active,
        );
        camera.active = active;
      }
      return camera;
    }
    return { ...camera, isWireless: false };
  });

  const handleSaveDepClick = ({ cameraId, deployment }) => {
    setShowSaveDepForm(true);
    setCameraSelected(cameraId);
    setDeploymentSelected(deployment);
  };

  const handleDeleteDepClick = ({ cameraId, deployment }) => {
    setShowDeleteDepForm(true);
    setCameraSelected(cameraId);
    setDeploymentSelected(deployment);
  };

  const handleCancelEditClick = () => setShowSaveDepForm(false);
  const handleCancelDeleteClick = () => setShowDeleteDepForm(false);

  return (
    <div>
      {camerasLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      {showSaveDepForm ? (
        <SaveDeploymentForm
          project={project}
          cameraId={cameraSelected}
          deployment={deploymentSelected}
          handleClose={handleCancelEditClick}
        />
      ) : showDeleteDepForm ? (
        <DeleteDeploymentForm
          cameraId={cameraSelected}
          deployment={deploymentSelected}
          handleClose={handleCancelDeleteClick}
        />
      ) : (
        <>
          <CameraList
            cameras={enrichedCams}
            handleSaveDepClick={handleSaveDepClick}
            handleDeleteDepClick={handleDeleteDepClick}
          />
          {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && (
            <>
              <Separator />
              <RegisterCameraForm />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CameraAdminModal;
