import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import {
  selectViewsLoading,
  selectSelectedView,
  editView } from './viewsSlice';
import Button from '../../components/Button';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


const ViewName = styled.span({
  fontWeight: '$5',
});

const deleteViewSchema = Yup.object().shape({
  _id: Yup.string().required('A view ID is required'),
});

const DeleteViewForm = ({ handleClose }) => {
  const [queuedForClose, setQueuedForClose ] = useState(false);
  const viewsLoading = useSelector(selectViewsLoading);
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !viewsLoading) {
      handleClose();
    }
  }, [queuedForClose, viewsLoading, handleClose])

  const handleDeleteViewSubmit = (values) => {
    dispatch(editView('delete', values));
    setQueuedForClose(true);
  };
  

  return (
    <div>
      {viewsLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <FormWrapper>
        <Formik
          initialValues={{ _id: selectedView._id }}
          validationSchema={deleteViewSchema}
          onSubmit={(values) => handleDeleteViewSubmit(values)}
        >
          {({ errors, touched }) => (
            <Form>
              <HelperText>
                Are you sure you'd like to delete 
                the <ViewName>{selectedView.name}</ViewName> view?
              </HelperText>
              <Field
                name='_id'
                type='hidden'
              />
              <ButtonRow>
                <Button type='submit' size='large'>
                  Delete view
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default DeleteViewForm;

