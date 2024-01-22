import { useSelector } from "react-redux";
import { selectAvailLabels, selectLabelsLoading } from '../../filters/filtersSlice.js';
import { SimpleSpinner, SpinnerOverlay } from '../../../components/Spinner';
import { LabelList } from './components';
import NewLabelForm from "./NewLabelForm";
import EditLabelForm from "./EditLabelForm";

const ManageLabelsModal = () => {
  const labels = useSelector(selectAvailLabels).options;
  const { isLoading } = useSelector(selectLabelsLoading);

  return (
    <>
      {isLoading &&
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      }
      <LabelList>
        {labels.map(({ _id, name, color, source }) => (
          <EditLabelForm key={_id} _id={_id} name={name} color={color} source={source} />
        ))}
      </LabelList>
      <NewLabelForm />
    </>
  )
}

export default ManageLabelsModal;
