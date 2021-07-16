import React, { useState }from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import moment from 'moment';
import { selectCameras } from './camerasSlice';
import CameraList from './CameraList';
import AddDeploymentForm from './AddDeploymentForm';
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
  const [ showAddDeploymentForm, setShowAddDeploymentForm ] = useState(false);
  const [ cameraSelected, setCameraSelected ] = useState();


  const handleAddDepButtonClick = (cameraId) => {
    setShowAddDeploymentForm(true);
    console.log('cameraId: ', cameraId)
    setCameraSelected(cameraId)
  };

  const handleDiscardDeploymentClick = () => {
    setShowAddDeploymentForm(false);
  };

  return (
    <div>
      {cameras.cameras.length
        ? showAddDeploymentForm
          ? <AddDeploymentForm
              cameraId={cameraSelected}
              handleClose={handleDiscardDeploymentClick}
            />
          : <CameraList
              cameras={cameras}
              handleAddDepButtonClick={handleAddDepButtonClick}
            />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};

export default CameraAdminModal;

