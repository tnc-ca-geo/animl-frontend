import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectLabels, selectProjectLabelsLoading } from '../projectsSlice.js';
import { selectDeleteProjectLabelLoading, fetchTask } from '../../tasks/tasksSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner';
import { LabelList } from './components';
import NewLabelForm from './NewLabelForm';
import EditLabelForm from './EditLabelForm';
import DeleteLabelsAlert from './DeleteLabelsAlert.jsx';

const ManageLabelsModal = () => {
  const dispatch = useDispatch();
  const labels = useSelector(selectLabels);

  const sortedLabels = [...labels].sort((labelA, labelB) => {
    return labelA.name.toLowerCase() > labelB.name.toLowerCase() ? 1 : -1;
  });

  const { isLoading: labelsLoading } = useSelector(selectProjectLabelsLoading);
  const deleteProjectLabelLoading = useSelector(selectDeleteProjectLabelLoading); // label deletion task is in progress

  // handle polling for task completion
  useEffect(() => {
    const deleteProjectLabelPending =
      deleteProjectLabelLoading.isLoading && deleteProjectLabelLoading.taskId;
    if (deleteProjectLabelPending) {
      dispatch(fetchTask(deleteProjectLabelLoading.taskId));
    }
  }, [deleteProjectLabelLoading, dispatch]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);

  return (
    <>
      {(labelsLoading || deleteProjectLabelLoading.isLoading) && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <LabelList>
        {sortedLabels.map((label) => (
          <EditLabelForm
            key={label._id}
            label={label}
            labels={sortedLabels}
            setLabelToDelete={setLabelToDelete}
            setAlertOpen={setAlertOpen}
          />
        ))}
      </LabelList>
      <NewLabelForm labels={sortedLabels} />
      <DeleteLabelsAlert open={alertOpen} setAlertOpen={setAlertOpen} label={labelToDelete} />
    </>
  );
};

export default ManageLabelsModal;
