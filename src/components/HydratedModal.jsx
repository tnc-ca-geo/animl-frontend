import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import { Modal } from './Modal.jsx';
import ImagesStatsModal from '../features/images/ImagesStatsModal.jsx';
import ExportModal from '../features/images/ExportModal.jsx';
import CameraAdminModal from '../features/cameras/CameraAdminModal.jsx';
import AutomationRulesForm from '../features/projects/AutomationRulesForm.jsx';
import SaveViewForm from '../features/projects/SaveViewForm.jsx';
import DeleteViewForm from '../features/projects/DeleteViewForm.jsx';
import BulkUploadForm from '../features/upload/BulkUploadForm.jsx';
import { clearExport, clearStats } from '../features/images/imagesSlice';
import {
  selectModalOpen,
  selectModalContent,
  setModalOpen,
  setModalContent
} from '../features/projects/projectsSlice';

// Modal populated with content
const HydratedModal = () => {
  const dispatch = useDispatch();
  const modalOpen = useSelector(selectModalOpen);
  const modalContent = useSelector(selectModalContent);

  const modalContentMap = {
    'stats-modal': {
      title: 'Stats',
      size: 'md',
      content: <ImagesStatsModal/>,
      callBackOnClose: () => dispatch(clearStats()),
    },
    'export-modal': {
      title: 'Export data',
      size: 'md',
      content: <ExportModal/>,
      callBackOnClose: () => dispatch(clearExport()),
    },
    'camera-admin-modal': {
      title: 'Manage Cameras',
      size: 'md',
      content: <CameraAdminModal/>,
      callBackOnClose: () => { 
        console.log('callBackOnClose() - reverting moment global timezone to local timezone');
        moment.tz.setDefault();
      },
    },
    'automation-rules-form': {
      title: 'Configure Automation Rules',
      size: 'md',
      content: <AutomationRulesForm/>,
      callBackOnClose: () => true,
    },
    'save-view-form': {
      title: 'Save View',
      size: 'sm',
      content: <SaveViewForm/>,
      callBackOnClose: () => true,
    },
    'delete-view-form': {
      title: 'Delete View',
      size: 'sm',
      content: <DeleteViewForm/>,
      callBackOnClose: () => true,
    },
    'bulk-upload-form': {
      title: 'Bulk upload',
      size: 'md',
      content: <BulkUploadForm/>,
      callBackOnClose: () => true,
    },
  };

  const handleModalToggle = (content) => {
    dispatch(setModalOpen(!modalOpen));
    if (modalOpen) {
      // modal is being closed, so clean up
      modalContentMap[modalContent].callBackOnClose();
      content = null;
    }
    dispatch(setModalContent(content));
  };

  return (
    <Modal 
      open={modalOpen}
      handleModalToggle={() => handleModalToggle(modalContent)}
      title={modalContent && modalContentMap[modalContent].title}
      size={modalContent && modalContentMap[modalContent].size}
    >
      {modalContent && modalContentMap[modalContent].content}
    </Modal>
  );
};

export default HydratedModal;