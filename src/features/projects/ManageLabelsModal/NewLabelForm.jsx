import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { createLabel } from "../projectsSlice";
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


const NewLabelForm = () => {
  const dispatch = useDispatch();
  const [ showNewLabelForm, setShowNewLabelForm ] = useState(false);

  const onClose = useCallback(() => setShowNewLabelForm(false), []);
  const onSubmit = useCallback((values) => {
    dispatch(createLabel(values));
    setShowNewLabelForm(false);
  });

  return (
      <Formik
        initialValues={{ name: '', color: `#${Math.floor(Math.random()*16777215).toString(16)}` }}
        validationSchema={label}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <LabelRow>
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
