import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { updateLabel } from "../projectsSlice";
import LabelPill from "../../../components/LabelPill";
import Button from "../../../components/Button";
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';

export const label = Yup.object().shape({
  name: Yup.string().required('Enter a label name.'),
  color: Yup.string().required('Select a color.'),
});

const EditLabelForm = ({ _id, name, color, source }) => {
  const dispatch = useDispatch();
  const [ showForm, setShowForm ] = useState(false);

  const onClose = useCallback(() => setShowForm((prev) => !prev), []);
  const onSubmit = useCallback((values) => {
    dispatch(updateLabel(values));
    setShowForm(false);
  }, []);

  return (
    <Formik
      initialValues={{ _id, name, color }}
      validationSchema={label}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <LabelRow>
          <LabelHeader>
            <LabelPill color={values.color}>
              {values.name}
            </LabelPill>
            <LabelActions>
              <Button onClick={onClose} type='button' size='small'>Edit</Button>
            </LabelActions>
          </LabelHeader>
          {showForm && (
            <LabelForm onCancel={onClose} />
          )}
        </LabelRow>
      )}
    </Formik>
  );
}

export default EditLabelForm;
