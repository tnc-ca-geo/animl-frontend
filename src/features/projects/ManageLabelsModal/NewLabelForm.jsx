import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { createProjectLabel } from "../../filters/filtersSlice.js";
import LabelPill from "../../../components/LabelPill";
import Button from "../../../components/Button";
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';
import { getRandomColor } from "../../../app/utils.js";

export const label = Yup.object().shape({
  name: Yup.string().required('Enter a label name.'),
  color: Yup.string()
    .matches(/^#[0-9A-F]{6}$/, { message: "Enter a valid color code with 6 digits" })
    .required('Select a color.'),
});


const NewLabelForm = () => {
  const dispatch = useDispatch();
  const [ showNewLabelForm, setShowNewLabelForm ] = useState(false);

  const onClose = useCallback(() => setShowNewLabelForm(false), []);
  const onSubmit = useCallback((values) => {
    dispatch(createProjectLabel(values));
    setShowNewLabelForm(false);
  });

  return (
      <Formik
        initialValues={{ name: '', color: `#${getRandomColor()}` }}
        validationSchema={label}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <LabelRow css={{ borderBottom: 'none' }}>
            <LabelHeader>
            { showNewLabelForm && (
              <LabelPill color={values.color}>
                { values.name || "New Label"}
              </LabelPill>
            )}
              <LabelActions>
                <Button size="small" onClick={() => setShowNewLabelForm(prev => !prev)}>New label</Button>
              </LabelActions>
            </LabelHeader>
            { showNewLabelForm && (
              <LabelForm onCancel={onClose} />
            )}
          </LabelRow>
        )}
      </Formik>
  )
}

export default NewLabelForm;
