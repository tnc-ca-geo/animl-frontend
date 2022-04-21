import React, { useEffect, useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const [ showSaveDepForm, setShowSaveDepForm ] = useState(false);
  const [ showDeleteDeptForm, setShowDeleteDepForm ] = useState(false);
  const [ cameraSelected, setCameraSelected ] = useState();
  const [ deploymentSelected, setDeploymentSelected ] = useState();
  const dispatch = useDispatch();

  const cameras = useSelector(selectCameras);
  const camerasLoading = useSelector(selectCamerasLoading);
  useEffect(() => {
    const { isLoading, noneFound } = camerasLoading;
    if (!cameras.length && !isLoading && !noneFound){
      dispatch(fetchCameras());
    }
  }, [cameras.length, camerasLoading, dispatch]);

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
    console.log('handleSaveDepClick: ', cameraId)
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

  // TODO AUTH: move spinner overlay to this component and remove from forms

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
              <RegisterCameraForm />
            </>
      }
    </div>
  );
};

export default CameraAdminModal;

