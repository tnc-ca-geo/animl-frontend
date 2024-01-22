import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { updateProjectLabel } from "../../filters/filtersSlice.js";
import LabelPill from "../../../components/LabelPill";
import IconButton from '../../../components/IconButton.jsx';
import { Pencil1Icon } from '@radix-ui/react-icons';
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

const EditLabelForm = ({ _id, name, color }) => {
  const dispatch = useDispatch();
  const [ showForm, setShowForm ] = useState(false);

  const onClose = useCallback(() => setShowForm((prev) => !prev), []);
  const onSubmit = useCallback((values) => {
    dispatch(updateProjectLabel(values));
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
              <IconButton
                variant='ghost'
                onClick={onClose}
              >
                <Pencil1Icon />
              </IconButton>
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
