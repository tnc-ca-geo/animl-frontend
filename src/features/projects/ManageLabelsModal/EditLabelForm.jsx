import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { updateProjectLabel } from "../projectsSlice.js";
import LabelPill from "../../../components/LabelPill";
import IconButton from '../../../components/IconButton.jsx';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';

const EditLabelForm = ({ label, labels, setLabelToDelete, setAlertOpen }) => {
  const  { _id, name, color, source, reviewerEnabled } = label;
  console.log('reviewerEnabled: ', reviewerEnabled)
  const dispatch = useDispatch();
  const [ showForm, setShowForm ] = useState(false);

  const onClose = useCallback(() => setShowForm((prev) => !prev), []);
  const onSubmit = useCallback((values) => {
    dispatch(updateProjectLabel(values));
    setShowForm(false);
  }, []);

  const deleteLabel = useCallback((values) => {
    console.log('handle delete label: ', values);
    setLabelToDelete(values);
    setAlertOpen(true);
  });

  const labelsNames = labels.map(({ name }) => name.toLowerCase());
  const schema = (initialName) => {
    return Yup.object().shape({
      name: Yup.string()
        .required('Enter a label name.')
        .test(
          'unique',
          'A label with this name already exists.',
          (val) => {
            if (val?.toLowerCase() === initialName.toLowerCase()) { // name hasn't changed
              return true;
            } else if (!labelsNames.includes(val?.toLowerCase())) { // name hasn't already been used
              return true; 
            } else {
              return false;
            }
          }),
      color: Yup.string()
        .matches(/^#[0-9A-F]{6}$/, { message: "Enter a valid color code with 6 digits" })
        .required('Select a color.'),
    });
  };

  return (
    <Formik
      initialValues={{ _id, name, color, reviewerEnabled }}
      validationSchema={schema(name)}
      onSubmit={onSubmit}
    >
      {({ values }) => (
        <LabelRow>
          <LabelHeader>
            <LabelPill color={values.color} name={values.name} />
            <LabelActions>
              <IconButton
                variant='ghost'
                onClick={onClose}
              >
                <Pencil1Icon />
              </IconButton>
              <IconButton
                variant='ghost'
                onClick={() => deleteLabel(values)}
              >
                <TrashIcon />
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
