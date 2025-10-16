import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import { Modal } from './Modal.jsx';
import ImagesStatsModal from '../features/images/ImagesStatsModal.jsx';
import ExportModal from '../features/images/ExportModal.jsx';
import CameraAdminModal from '../features/cameras/CameraAdminModal.jsx';
import AutomationRulesForm from '../features/projects/AutomationRulesForm.jsx';
import SaveViewForm from '../features/projects/SaveViewForm.jsx';
import DeleteViewForm from '../features/projects/DeleteViewForm.jsx';
import ManageUsersModal from '../features/projects/ManageUsersModal.jsx';
import BulkUploadForm from '../features/upload/BulkUploadForm.jsx';
import UpdateCameraSerialNumberForm from '../features/cameras/UpdateCameraSerialNumberForm.jsx';
import {
  clearStats,
  clearExport,
  clearErrorsExport,
  clearDeployments,
  selectStatsLoading,
  selectAnnotationsExportLoading,
  selectErrorsExportLoading,
  selectDeploymentsLoading,
  selectCameraSerialNumberLoading,
  clearCameraSerialNumberTask,
  selectDeleteImagesLoading,
} from '../features/tasks/tasksSlice.js';
import {
  selectModalOpen,
  selectModalContent,
  setModalOpen,
  setModalContent,
  setSelectedCamera,
} from '../features/projects/projectsSlice';
import { clearUsers } from '../features/projects/usersSlice.js';
import {
  ManageLabelsAndTagsModal,
  ManageLabelsAndTagsModalTitle,
} from '../features/projects/ManageTagsAndLabelsModal.jsx';

// Modal populated with content
const HydratedModal = () => {
  const dispatch = useDispatch();
  const modalOpen = useSelector(selectModalOpen);
  const modalContent = useSelector(selectModalContent);

  // loading states of async tasks
  const statsLoading = useSelector(selectStatsLoading);
  const annotationsExportLoading = useSelector(selectAnnotationsExportLoading);
  const errorsExportLoading = useSelector(selectErrorsExportLoading);
  const deploymentsLoading = useSelector(selectDeploymentsLoading);
  const cameraSerialNumberLoading = useSelector(selectCameraSerialNumberLoading);
  const deleteImagesLoading = useSelector(selectDeleteImagesLoading);
  const asyncTaskLoading =
    statsLoading.isLoading ||
    annotationsExportLoading.isLoading ||
    errorsExportLoading.isLoading ||
    deploymentsLoading.isLoading ||
    cameraSerialNumberLoading.isLoading ||
    deleteImagesLoading.isLoading;

  const [manageTagsAndLabelsTab, setManageTagsAndLabelsTab] = useState('labels');

  const modalContentMap = {
    'stats-modal': {
      title: 'Stats Dashboard',
      size: 'lg',
      content: <ImagesStatsModal />,
      callBackOnClose: () => dispatch(clearStats()),
    },
    'export-modal': {
      title: 'Export annotations',
      size: 'md',
      content: <ExportModal />,
      callBackOnClose: () => dispatch(clearExport()),
    },
    'camera-admin-modal': {
      title: 'Manage Cameras and Deployments',
      size: 'md',
      fullHeight: true,
      content: <CameraAdminModal />,
      callBackOnClose: () => {
        moment.tz.setDefault();
        dispatch(clearDeployments());
      },
    },
    'automation-rules-form': {
      title: 'Configure Automation Rules',
      size: 'lg',
      fullHeight: true,
      content: <AutomationRulesForm />,
      callBackOnClose: () => true,
    },
    'save-view-form': {
      title: 'Save View',
      size: 'sm',
      content: <SaveViewForm />,
      callBackOnClose: () => true,
    },
    'delete-view-form': {
      title: 'Delete View',
      size: 'sm',
      content: <DeleteViewForm />,
      callBackOnClose: () => true,
    },
    'bulk-upload-form': {
      title: 'Bulk upload',
      size: 'lg',
      content: <BulkUploadForm />,
      callBackOnClose: () => dispatch(clearErrorsExport()),
    },
    'manage-users-form': {
      title: 'Manage users',
      size: 'md',
      content: <ManageUsersModal />,
      callBackOnClose: () => dispatch(clearUsers()),
    },
    'update-serial-number-form': {
      title: 'Edit Camera Serial Number',
      size: 'md',
      content: <UpdateCameraSerialNumberForm />,
      callBackOnClose: () => {
        dispatch(setSelectedCamera(null));
        dispatch(clearCameraSerialNumberTask());
      },
    },
    'manage-tags-and-labels-form': {
      title: (
        <ManageLabelsAndTagsModalTitle
          tab={manageTagsAndLabelsTab}
          setTab={setManageTagsAndLabelsTab}
        />
      ),
      size: 'md',
      content: <ManageLabelsAndTagsModal tab={manageTagsAndLabelsTab} />,
      callBackOnClose: () => {
        setManageTagsAndLabelsTab('labels');
        return true;
      },
    },
  };

  const handleModalToggle = (content) => {
    // If async tasks are loading, don't allow modal to close
    if (asyncTaskLoading) return;
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
      fullHeight={modalContent && modalContentMap[modalContent].fullHeight}
    >
      {modalContent && modalContentMap[modalContent].content}
    </Modal>
  );
};

export default HydratedModal;
