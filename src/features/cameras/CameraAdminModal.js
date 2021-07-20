import React, { useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras } from './camerasSlice';
import CameraList from './CameraList';
import SaveDeploymentForm from './SaveDeploymentForm';
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
  const [ showSaveDeploymentForm, setShowSaveDeploymentForm ] = useState(false);
  const [ cameraSelected, setCameraSelected ] = useState();
  const [ deploymentSelected, setDeploymentSelected ] = useState();


  const handleSaveDepClick = ({ cameraId, deployment }) => {
    setShowSaveDeploymentForm(true);
    setCameraSelected(cameraId);
    setDeploymentSelected(deployment);
  };

  const handleDiscardDeploymentClick = () => {
    setShowSaveDeploymentForm(false);
  };

  return (
    <div>
      {cameras.cameras.length
        ? showSaveDeploymentForm
          ? <SaveDeploymentForm
              cameraId={cameraSelected}
              deployment={deploymentSelected}
              handleClose={handleDiscardDeploymentClick}
            />
          : <CameraList
              cameras={cameras}
              handleSaveDepClick={handleSaveDepClick}
            />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};

export default CameraAdminModal;

