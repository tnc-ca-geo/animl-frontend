import React, { useEffect, useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserCurrentRoles } from '../user/userSlice';
import { hasRole, WRITE_CAMERA_REGISTRATION_ROLES } from '../../auth/roles';
import {
  selectCamerasLoading,
  selectCameras,
  fetchCameras,
} from './camerasSlice';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
import DeleteDeploymentForm from './DeleteDeploymentForm';
import RegisterCameraForm from './RegisterCameraForm';
import { selectSelectedProject } from '../projects/projectsSlice';


const CameraAdminModal = () => {
  const project = useSelector(selectSelectedProject);
  const userRoles = useSelector(selectUserCurrentRoles);
  const [ showSaveDepForm, setShowSaveDepForm ] = useState(false);
  const [ showDeleteDeptForm, setShowDeleteDepForm ] = useState(false);
  const [ cameraSelected, setCameraSelected ] = useState();
  const [ deploymentSelected, setDeploymentSelected ] = useState();
  const dispatch = useDispatch();

  // fetch camera source records
  const cameras = useSelector(selectCameras);
  const camerasLoading = useSelector(selectCamerasLoading);
  useEffect(() => {
    const { isLoading, noneFound } = camerasLoading;
    if (!cameras.length && !isLoading && !noneFound){
      dispatch(fetchCameras());
    }
  }, [cameras.length, camerasLoading, dispatch]);

  // enrich camera config records with active state
  let enrichedCams = [];
  if (project.cameraConfigs.length && cameras.length) {
    enrichedCams = project.cameraConfigs.map((camConfig) => {
      const camera = cameras.find((cam) => cam._id === camConfig._id);
      const active = camera.projRegistrations.some((pr) => (
        pr.projectId === project._id && pr.active
      ));
      return { ...camConfig, active };
    });
  }

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
      {showSaveDepForm
        ? <SaveDeploymentForm
            project={project}
            cameraId={cameraSelected}
            deployment={deploymentSelected}
            handleClose={handleCancelEditClick}
          />
        : showDeleteDeptForm
          ? <DeleteDeploymentForm 
              cameraId={cameraSelected}
              deployment={deploymentSelected}
              handleClose={handleCancelDeleteClick}
            />
          : <>
              <CameraList
                cameras={enrichedCams}
                handleSaveDepClick={handleSaveDepClick}
                handleDeleteDepClick={handleDeleteDepClick}
              />
              {hasRole(userRoles, WRITE_CAMERA_REGISTRATION_ROLES) && 
                <RegisterCameraForm />
              }
            </>
      }
    </div>
  );
};

export default CameraAdminModal;

