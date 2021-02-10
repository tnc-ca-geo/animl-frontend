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
  selectActiveFilters,
  editView,
} from './filtersSlice';

const SaveModeTab = styled(Button, {
  color: '$hiContrast',
  backgroundColor: '$loContrast',
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

const ViewName = styled.span({
  fontWeight: '$5',
});

const Row = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  ':not(:last-child)': {
    marginBottom: '$5',
  }
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

const SaveViewForm = ({ handleClose }) => {
  const [saveMode, setSaveMode] = useState();
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const dispatch = useDispatch();

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
    dispatch(editView(operation, payload));
    handleClose();  // TODO: show loading & wait for success to close
  };

  return (
    <div>
      <Row>
        <SaveModeTab
          size='large'
          disabled={!selectedView.editable}
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
      </Row>
      <Row>
        {(saveMode === 'update') &&
          <FormWrapper>
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
                  <SubmitButton size='large' type='submit'>
                    Save view
                  </SubmitButton>
                </Form>
              )}
            </Formik>
          </FormWrapper>
        }
        {(saveMode === 'create') &&
          <FormWrapper>
            <Formik
              initialValues={{
                name: '',
                description: '',
                filters: activeFilters,
                editable: true,
              }}
              validationSchema={newViewSchema}
              onSubmit={(values) => {
                handleSaveViewSubmit(saveMode, selectedView, values);
              }}              >
              {({ errors, touched, isValid, dirty }) => (
                <Form>
                  <FormFieldWrapper>
                    <label htmlFor='name'>Name</label>
                    <Field
                      name='name'
                      id='name'
                    />
                    <ErrorMessage component={FormError} name='name' />
                  </FormFieldWrapper>
                  <FormFieldWrapper>
                    <label htmlFor='description'>Description</label>
                    <Field
                      name='description'
                      id='description'
                      component='textarea'
                    />
                    <ErrorMessage
                      component={FormError}
                      name='description'
                    />
                  </FormFieldWrapper>
                  <Field
                    name='filters'
                    type='hidden'
                  />
                  <Field
                    name='editable'
                    type='hidden'
                  />
                  <SubmitButton 
                    type='submit'
                    size='large'
                    disabled={!isValid || !dirty}
                  >
                    Save view
                  </SubmitButton>
                </Form>
              )}
            </Formik>
          </FormWrapper>
        }
      </Row>
    </div>
  );
};

export default SaveViewForm;

