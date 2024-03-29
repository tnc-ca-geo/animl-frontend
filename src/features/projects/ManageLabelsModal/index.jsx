import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLabels, selectProjectLabelsLoading } from '../projectsSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner';
import { LabelList } from './components';
import NewLabelForm from './NewLabelForm';
import EditLabelForm from './EditLabelForm';
import DeleteLabelsAlert from './DeleteLabelsAlert.jsx';

const ManageLabelsModal = () => {
  const labels = useSelector(selectLabels);

  const sortedLabels = [...labels].sort((labelA, labelB) => {
    return labelA.name.toLowerCase() > labelB.name.toLowerCase() ? 1 : -1;
  });

  const { isLoading } = useSelector(selectProjectLabelsLoading);

  const [alertOpen, setAlertOpen] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);

  return (
    <>
      {isLoading && (
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
