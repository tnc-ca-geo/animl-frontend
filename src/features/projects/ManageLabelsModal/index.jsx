import { useSelector } from "react-redux";
import { selectAvailLabels } from '../../filters/filtersSlice.js';
import { LabelList } from './components';
import NewLabelForm from "./NewLabelForm";
import EditLabelForm from "./EditLabelForm";

const ManageLabelsModal = () => {
  const labels = useSelector(selectAvailLabels).options;

  return (
    <>
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
