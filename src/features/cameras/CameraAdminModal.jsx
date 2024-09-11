import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { selectUserCurrentRoles } from '../auth/authSlice';
import { hasRole, WRITE_CAMERA_REGISTRATION_ROLES } from '../auth/roles';
import {
  selectWirelessCamerasLoading,
  selectWirelessCameras,
  fetchWirelessCameras,
} from './wirelessCamerasSlice';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
import DeleteDeploymentForm from './DeleteDeploymentForm';
import RegisterCameraForm from './RegisterCameraForm';
import { selectSelectedProject } from '../projects/projectsSlice';
import { enrichCameraConfigs } from '../tasks/utils';

const CameraAdminModal = () => {
  const project = useSelector(selectSelectedProject);
  const userRoles = useSelector(selectUserCurrentRoles);
  const [showSaveDepForm, setShowSaveDepForm] = useState(false);
  const [showDeleteDeptForm, setShowDeleteDepForm] = useState(false);
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
      {showSaveDepForm ? (
        <SaveDeploymentForm
          project={project}
          cameraId={cameraSelected}
          deployment={deploymentSelected}
          handleClose={handleCancelEditClick}
        />
      ) : showDeleteDeptForm ? (
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
          {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && <RegisterCameraForm />}
        </>
      )}
    </div>
  );
};

export default CameraAdminModal;
