import React, { useEffect, useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import {
  selectCamerasLoading,
  selectCameras,
  fetchCameras,
} from './camerasSlice';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
import DeleteDeploymentForm from './DeleteDeploymentForm';
import RegisterCameraForm from './RegisterCameraForm';
import Accordion from '../../components/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import {
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';
import { selectSelectedProject } from '../projects/projectsSlice';

// TODO AUTH: Add UI for unregistering cameras
// TODO AUTH: indicate whether a camera is currently registered or not

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
    if (!cameras.length && !camerasLoading) {
      dispatch(fetchCameras());
    }
  }, [cameras.length, camerasLoading, dispatch]);

  let enrichedCams = [];
  if (project.cameras.length && cameras.length) {
    enrichedCams = project.cameras.map((c) => {
      const cameraSource = cameras.find((cs) => cs._id === c._id);
      const active = cameraSource.projRegistrations.some((pr) => (
        pr.project === project._id && pr.active
      ));
      return { ...c, active };
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
  }

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

