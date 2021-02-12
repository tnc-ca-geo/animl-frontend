import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import SubmitButton from '../../components/SubmitButton';
import FormWrapper from '../../components/FormWrapper';
import { selectSelectedView, editView } from './viewsSlice';

const FieldRow = styled.div({
  paddingBottom: '$3',
  display: 'flex',
});

const ButtonRow = styled(FieldRow, {
  justifyContent: 'flex-end',
  button: {
    marginRight: '$3',
    ':last-child': {
      marginRight: '0',
    },
  }
});

const ViewName = styled.span({
  fontWeight: '$5',
});

const deleteViewSchema = Yup.object().shape({
  _id: Yup.string().required('A name is required'),
});

const DeleteViewForm = ({ handleClose }) => {
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  const handleDeleteViewSubmit = (values) => {
    dispatch(editView('delete', values));
    handleClose();  // TODO: show loading & wait for success to close
  };

  return (
    <FormWrapper>
      <p>
        Are you sure you'd like to delete 
        the <ViewName>{selectedView.name}</ViewName> view?
      </p>
      <Formik
        initialValues={{ _id: selectedView._id }}
        validationSchema={deleteViewSchema}
        onSubmit={(values) => handleDeleteViewSubmit(values)}
      >
        {({ errors, touched }) => (
          <Form>
            <Field
              name='_id'
              type='hidden'
            />
            <ButtonRow>
              <SubmitButton type='submit' size='large'>
                Delete view
              </SubmitButton>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default DeleteViewForm;

