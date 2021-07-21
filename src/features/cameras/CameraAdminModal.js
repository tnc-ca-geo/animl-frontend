import React, { useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras } from './camerasSlice';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
import DeleteDeploymentForm from './DeleteDeploymentForm';
import Accordion from '../../components/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import {
  DATE_FORMAT_READABLE as DFR,
  DATE_FORMAT_EXIF as EXIF,
} from '../../config';

const CameraAdminModal = () => {
  const cameras = useSelector(selectCameras);
  const [ showSaveDepForm, setShowSaveDepForm ] = useState(false);
  const [ showDeleteDeptForm, setShowDeleteDepForm ] = useState(false);
  const [ cameraSelected, setCameraSelected ] = useState();
  const [ deploymentSelected, setDeploymentSelected ] = useState();


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

  return (
    <div>
      {cameras.cameras.length
        ? showSaveDepForm
          ? <SaveDeploymentForm
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
            : <CameraList
                cameras={cameras}
                handleSaveDepClick={handleSaveDepClick}
                handleDeleteDepClick={handleDeleteDepClick}
              />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};

export default CameraAdminModal;

