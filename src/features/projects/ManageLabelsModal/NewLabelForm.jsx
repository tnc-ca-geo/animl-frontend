import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { createProjectLabel, selectAvailLabels } from "../../filters/filtersSlice.js";
import LabelPill from "../../../components/LabelPill";
import Button from "../../../components/Button";
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';
import { getRandomColor } from "../../../app/utils.js";

const NewLabelForm = () => {
  const dispatch = useDispatch();
  const [ showNewLabelForm, setShowNewLabelForm ] = useState(false);

  const onClose = useCallback(() => setShowNewLabelForm(false), []);
  const onSubmit = useCallback((values, { resetForm }) => {
    dispatch(createProjectLabel(values));
    setShowNewLabelForm(false);
    resetForm();
  });

  const labelsNames = useSelector(selectAvailLabels).options.map(({ name }) => name.toLowerCase());
  const schema = useMemo(() => {
    return Yup.object().shape({
      name: Yup.string()
        .required('Enter a label name.')
        .test(
          'unique',
          'A label with this name already exists.',
          (val) => !labelsNames.includes(val?.toLowerCase())),
      color: Yup.string()
        .matches(/^#[0-9A-F]{6}$/, { message: "Enter a valid color code with 6 digits" })
        .required('Select a color.'),
    });
  }, []);

  return (
      <Formik
        initialValues={{ name: '', color: `#${getRandomColor()}` }}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <LabelRow css={{ borderBottom: 'none' }}>
            <LabelHeader>
            { showNewLabelForm && (
              <LabelPill color={values.color} name={values.name || 'New Label'}/>
            )}
              <LabelActions>
                <Button size='small' onClick={() => setShowNewLabelForm(prev => !prev)}>New label</Button>
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
