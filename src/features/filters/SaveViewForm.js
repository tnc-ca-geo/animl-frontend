import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import {
  selectSelectedView,
  selectActiveFilters,
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

const SaveModeTab = styled(Button, {
  margin: '$0 $2',
  svg: {
    paddingRight: '$2'
  },
  ':hover': {
    backgroundColor: '$gray300',
    cursor: 'pointer',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$blue200',
        borderColor: '$blue500',
        color: '$blue500',
        ':hover': {
          backgroundColor: '$blue200',
          cursor: 'default',
        },
      }
    }
  }
});

const SaveModeSelector = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '$3',
});

const ViewName = styled.span({
  fontWeight: '$5',
})

const Row = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const newViewSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('A name is required'),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(500, 'Too Long!'),
});

const SaveViewModal = ({ handleClose }) => {
  const [saveMode, setSaveMode] = useState();
  const [isEditable, setIsEditable] = useState(true);
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const dispatch = useDispatch();

  useEffect(() => {
    // TODO: implement 'isEditable' feild for views 
    // (and set 'All Images' to false)
    setIsEditable(true)
  }, [selectedView])

  const handleSaveModeSelection = (mode) => {
    setSaveMode(mode);
  };

  const handleSaveViewSubmit = (operation, selectedView, formVals) => {
    const payload = (operation === 'update')
      ? {
          _id: selectedView._id,
          diffs: {
            filters: formVals.filters,
          }
        }
      : formVals;
    dispatch(editView({ operation, payload }));
    handleClose();  // TODO: show loading & wait for success to close
  };

  return (
    <div>
      <SaveModeSelector>
        <SaveModeTab
          size='large'
          disabled={!isEditable}
          active={saveMode === 'update' ? true : false}
          onClick={() => handleSaveModeSelection('update')}
        >
          <FontAwesomeIcon icon={['fas', 'edit']} />
          Update current view
        </SaveModeTab>
        <SaveModeTab
          size='large'
          active={saveMode === 'create' ? 'true' : 'false'}
          onClick={() => handleSaveModeSelection('create')}
        >
          <FontAwesomeIcon icon={['fas', 'plus']} />
          Create new view
        </SaveModeTab>
      </SaveModeSelector>
      <Row>
        {(saveMode === 'update') &&
          <StyledForm>
            <p>
              Are you sure you'd like to overwrite the filters for 
              the <ViewName>{selectedView.name}</ViewName> view?
            </p>
            <Formik
              initialValues={{ filters: activeFilters }}
              onSubmit={(values) => {
                handleSaveViewSubmit(saveMode, selectedView, values);
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  <Field
                    name='filters'
                    type='hidden'
                  />
                  <Button type='submit'>
                    Save view
                  </Button>
                </Form>
              )}
            </Formik>
          </StyledForm>
        }
        {(saveMode === 'create') &&
          <StyledForm>
            <Formik
              initialValues={{
                name: '',
                description: '',
                filters: activeFilters,
              }}
              validationSchema={newViewSchema}
              onSubmit={(values) => {
                handleSaveViewSubmit(saveMode, selectedView, values);
              }}              >
              {({ errors, touched, isValid, dirty }) => (
                <Form>
                  <StyledField>
                    <label htmlFor='name'>Name</label>
                    <Field
                      name='name'
                      id='name'
                    />
                    <StyledErrorMessage name='name' />
                  </StyledField>
                  <StyledField>
                    <label htmlFor='description'>Description</label>
                    <Field
                      name='description'
                      id='description'
                      component='textarea'
                    />
                    <StyledErrorMessage name='description' />
                  </StyledField>
                  <Field
                    name='filters'
                    type='hidden'
                  />
                  <Button 
                    type='submit'
                    disabled={!isValid || !dirty}
                  >
                    Save view
                  </Button>
                </Form>
              )}
            </Formik>
          </StyledForm>
        }
      </Row>
    </div>
  );
};

export default SaveViewModal;

