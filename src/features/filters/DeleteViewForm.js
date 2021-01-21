import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import {
  selectSelectedView,
  editView,
} from './filtersSlice';

const StyledErrorMessage = styled(ErrorMessage, {
  color: '$warning',
})

const StyledField = styled.div({
  marginBottom: '$3',
});

// TODO: move a lot of this into a generic from component
const StyledForm = styled.div({
  display: 'block',
  width: '100%',
  label: {
    display: 'inherit',
    width: '100%',
    fontFamily: '$mono',
    fontSize: '$3',
    fontWeight: '$4',
    color: '$gray600',
  },
  input: {
    display: 'inherit',
    width: '100%',
    fontSize: '$4',
    color: '$hiContrast',
    padding: '$2',
    boxSizing: 'border-box',
  },
  textarea: {
    display: 'inherit',
    width: '100%',
    fontFamily: '$roboto',
    fontSize: '$4',
    color: '$hiContrast',
    padding: '$2',
    boxSizing: 'border-box',
  },
  button: {
    display: 'inherit',
    width: '100%',
    height: '$6',
    marginTop: '$3',
    border: '$1 $blue500 solid',
    backgroundColor: '$blue500',
    color: '$loContrast',
    ':hover': {
      backgroundColor: '$loContrast',
      color: '$blue500',
    }
  }
});

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

const SaveViewModal = ({ handleClose }) => {
  const [isEditable, setIsEditable] = useState(true);
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  useEffect(() => {
    // TODO: implement 'isEditable' feild for views 
    // (and set 'All Images' to false)
    setIsEditable(true)
  }, [selectedView])


  const handleDeleteViewSubmit = (values) => {
    dispatch(editView({ operation: 'delete', payload: values}));
    handleClose();  // TODO: show loading & wait for success to close
  };

  return (
    <div>
      <Row>  
        <StyledForm>
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
                <Button type='submit'>
                  Delete view
                </Button>
              </Form>
            )}
          </Formik>
        </StyledForm>
      </Row>
    </div>
  );
};

export default SaveViewModal;

