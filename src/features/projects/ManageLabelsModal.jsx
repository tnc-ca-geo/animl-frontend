import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { styled } from "../../theme/stitches.config";
import { selectLabels, updateLabel } from "./projectsSlice";
import LabelPill from "../../components/LabelPill";
import Button from "../../components/Button";
import {
  FormWrapper,
  FormFieldWrapper,
  FormError,
  ButtonRow,
} from '../../components/Form';

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
})

const LabelForm = ({ _id, name, color, onClose }) => {
  const dispatch = useDispatch();
  return (
    <FormWrapper>
      <Formik
        initialValues={{ _id, name, color }}
        validationSchema={label}
        onSubmit={(values) => {
          dispatch(updateLabel(values));
          onClose();
        }}
      >
        {({ errors, touched }) => (
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
                <Field name='color' id='color' />
                {!!errors.color && touched.color && (
                  <FormError>
                    {errors.color}
                  </FormError>
                )}
              </FormFieldWrapper>
              <FormButtons>
                <Button size='large' type='submit'>Save</Button>
                <Button size='large' type='button' onClick={onClose}>Cancel</Button>
              </FormButtons>
            </FormRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
}

const Label = ({ _id, name, color, source }) => {
  const [ showForm, setShowForm ] = useState(false);
  const onClose = useCallback(() => setShowForm((prev) => !prev), []);

  return (
    <LabelRow>
      <LabelHeader>
        <LabelPill
          css={{
            backgroundColor: color, 
            color: '#000',
          }}
        >
          {name}
        </LabelPill>
        <LabelActions>
          <Button onClick={onClose} type='button' size='large'>Edit</Button>
        </LabelActions>
      </LabelHeader>
      {showForm && <LabelForm _id={_id} name={name} color={color} source={source} onClose={onClose} />}
    </LabelRow>
  );
}

const ManageLabelsModal = () => {
  const labels = useSelector(selectLabels);
  return (
    <>
      {labels.map(({ _id, name, color, source }) => (
        <Label key={_id} _id={_id} name={name} color={color} source={source} />
      ))}
    </>
  )
}

export default ManageLabelsModal;
