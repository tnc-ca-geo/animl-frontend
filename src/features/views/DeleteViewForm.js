import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import {
  selectViewsLoading,
  selectSelectedView,
  editView } from './viewsSlice';
import SubmitButton from '../../components/SubmitButton';
import FormWrapper from '../../components/FormWrapper';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';

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

// TODO: extract
const HelperText = styled.div({
  padding: '$2 $3 $3 $3',
});

const deleteViewSchema = Yup.object().shape({
  _id: Yup.string().required('A name is required'),
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
                <SubmitButton type='submit' size='large'>
                  Delete view
                </SubmitButton>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>
  );
};

export default DeleteViewForm;

