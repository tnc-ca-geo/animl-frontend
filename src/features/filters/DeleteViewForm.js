import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import SubmitButton from '../../components/SubmitButton';
import FormWrapper from '../../components/FormWrapper';
import FormFieldWrapper from '../../components/FormFieldWrapper';
import FormError from '../../components/FormError';
import {
  selectSelectedView,
  editView,
} from './filtersSlice';

const ViewName = styled.span({
  fontWeight: '$5',
})

const Row = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
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
            <SubmitButton type='submit' size='large'>
              Delete view
            </SubmitButton>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

export default DeleteViewForm;

