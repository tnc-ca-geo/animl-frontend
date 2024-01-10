import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, useFormikContext } from 'formik';
import * as Yup from 'yup';

import { styled } from "../../theme/stitches.config";
import { selectLabels, updateLabel, createLabel } from "./projectsSlice";
import LabelPill from "../../components/LabelPill";
import Button from "../../components/Button";
import {
  FormWrapper,
  FormFieldWrapper,
  FormError,
  ButtonRow,
} from '../../components/Form';

const LabelList = styled('div', {
  overflowY: 'scroll',
  maxHeight: '500px'
});

const LabelRow = styled('div', {
  marginBottom: '$3',
  paddingBottom: '$3',
  borderBottom: '1px solid $border'
});

const LabelHeader = styled('div', {
  display: 'flex',
  marginBottom: '$2',
  alignItems: 'baseline'
});

const LabelActions = styled(ButtonRow, {
  flex: '1',
  textAlign: 'right',
  paddingTop: 0,
  paddingBottom: 0
});

const label = Yup.object().shape({
  name: Yup.string().required('Enter a label name.'),
  color: Yup.string().required('Select a color.'),
});

const FormRow = styled('div', {
  display: 'flex',
  alignItems: 'flex-end'
});

const FormButtons = styled(ButtonRow, {
  marginLeft: '$3',
});

const ColorPicker = styled('div', {
  display: 'flex',
  gap: '$1',
  alignItems: 'center'
});

const LabelForm = ({ onCancel }) => {
  const { values, errors, touched, setFieldValue, resetForm } = useFormikContext();

  return (
    <FormWrapper>
      <Form>
        <FormRow>
          <FormFieldWrapper>
            <label htmlFor='name'>Name</label>
            <Field name='name' id='name' />
            {!!errors.name && touched.name && (
              <FormError>
                {errors.name}
              </FormError>
            )}
          </FormFieldWrapper>
          <FormFieldWrapper>
            <label htmlFor='name'>Color</label>
            <ColorPicker>
              <Button
                type="button"
                aria-label="Get a new color"
                size="small"
                onClick={() => setFieldValue('color', `#${Math.floor(Math.random()*16777215).toString(16)}`)}
                css={{
                  backgroundColor: values.color,
                  borderColor: values.color
                }}
              >
                /\
              </Button>
              <Field name='color' id='color' />
            </ColorPicker>
            {!!errors.color && touched.color && (
              <FormError>
                {errors.color}
              </FormError>
            )}
          </FormFieldWrapper>
          <FormButtons>
            <Button size='small' type='submit'>Save</Button>
            <Button
              size='small'
              type='button'
              onClick={() => {
                resetForm();
                onCancel();
              }}
            >
              Cancel
            </Button>
          </FormButtons>
        </FormRow>
      </Form>
    </FormWrapper>
  );
}

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
            <LabelPill
              css={{
                backgroundColor: values.color, 
                color: '#000'
              }}
            >
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
        initialValues={{ name: '', color: initialLabelColor }}
        validationSchema={label}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <LabelRow>
            <LabelHeader>
            { showNewLabelForm && (
              <LabelPill
                css={{
                  backgroundColor: values.color, 
                  color: '#000',
                }}
              >
                { name || "New Label"}
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

const ManageLabelsModal = () => {
  const labels = useSelector(selectLabels);

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
