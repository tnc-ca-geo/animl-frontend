import { useCallback, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { updateProjectLabel, selectAvailLabels } from "../../filters/filtersSlice.js";
import LabelPill from "../../../components/LabelPill";
import IconButton from '../../../components/IconButton.jsx';
import { Pencil1Icon } from '@radix-ui/react-icons';
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';

const EditLabelForm = ({ _id, name, color }) => {
  const dispatch = useDispatch();
  const [ showForm, setShowForm ] = useState(false);

  const onClose = useCallback(() => setShowForm((prev) => !prev), []);
  const onSubmit = useCallback((values) => {
    dispatch(updateProjectLabel(values));
    setShowForm(false);
  }, []);

  const labelsNames = useSelector(selectAvailLabels).options.map(({ name }) => name);
  const schema = useMemo(() => {
    return Yup.object().shape({
      name: Yup.string()
        .required('Enter a label name.')
        .test(
          'unique',
          'A label with this name already exists.',
          (val) => !labelsNames.includes(val)),
      color: Yup.string()
        .matches(/^#[0-9A-F]{6}$/, { message: "Enter a valid color code with 6 digits" })
        .required('Select a color.'),
    });
  }, []);

  return (
    <Formik
      initialValues={{ _id, name, color }}
      validationSchema={schema}
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
