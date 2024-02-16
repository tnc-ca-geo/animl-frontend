import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from 'formik';
import * as Yup from 'yup';

import { createProjectLabel } from "../projectsSlice.js";
import LabelPill from "../../../components/LabelPill";
import Button from "../../../components/Button";
import LabelForm from './LabelForm';
import {
  LabelRow,
  LabelHeader,
  LabelActions,
} from './components';
import { getRandomColor } from "../../../app/utils.js";

const NewLabelForm = ({ labels }) => {
  const dispatch = useDispatch();
  const [ showNewLabelForm, setShowNewLabelForm ] = useState(false);

  const toggleOpenForm = useCallback(() => setShowNewLabelForm((prev) => !prev), []);
  const onSubmit = useCallback((values, { resetForm }) => {
    dispatch(createProjectLabel(values));
    setShowNewLabelForm(false);
    resetForm();
  });

  const labelsNames = labels.map(({ name }) => name.toLowerCase());
  const schema = useMemo(() => {
    return Yup.object().shape({
      name: Yup.string()
        .required('Enter a label name.')
        .matches(/^[a-zA-Z0-9_. -']*$/, 'Labels can\'t contain special characters')
        .test(
          'unique',
          'A label with this name already exists.',
          (val) => !labelsNames.includes(val?.toLowerCase())),
      color: Yup.string()
        .matches(/^#[0-9A-Fa-f]{6}$/, { message: "Enter a valid color code with 6 digits" })
        .required('Select a color.'),
    });
  }, []);

  return (
      <Formik
        enableReinitialize
        initialValues={{ name: '', color: `#${getRandomColor()}`, reviewerEnabled: true }}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ values, resetForm }) => (
          <LabelRow css={{ borderBottom: 'none' }}>
            <LabelHeader>
            { showNewLabelForm && (
              <LabelPill color={values.color} name={values.name || 'new label'}/>
            )}
              <LabelActions>
                <Button 
                  size='small' 
                  onClick={() => {
                    resetForm();
                    toggleOpenForm();
                  }}
                >
                  New label
                </Button>
              </LabelActions>
            </LabelHeader>
            { showNewLabelForm && (
              <LabelForm 
                onCancel={() => {
                  resetForm();
                  toggleOpenForm();
                }}
              />
            )}
          </LabelRow>
        )}
      </Formik>
  )
}

export default NewLabelForm;
