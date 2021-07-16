import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import {
  selectViewsLoading,
  selectSelectedView,
  selectUnsavedViewChanges,
  editView,
} from '../views/viewsSlice';
import { selectActiveFilters } from '../filters/filtersSlice';
import Button from '../../components/Button';
import {
  FormWrapper,
  FieldRow,
  ButtonRow,
  FormFieldWrapper,
  FormError,
  HelperText,
} from '../../components/Form';
import DatePickerWithFormik from '../../components/DatePicker';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';

const FormHeader = styled.div({
  fontWeight: '$3',
  textAlign: 'center'
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

const newDeploymentSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('A name is required'),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(500, 'Too Long!'),
  longitude: Yup.number().test(
    'is-decimal',
    'Coordinates must be in decimal degrees',
    value => (value + "").match(/^\d*\.{1}\d*$/),
  ),
  latitude: Yup.number().test(
    'is-decimal',
    'Coordinates must be in decimal degrees',
    value => (value + "").match(/^\d*\.{1}\d*$/),
  ),
  // startDate: Yup.date().required(),
});

const AddDeploymentForm = ({ cameraId, handleClose }) => {
  const [saveMode, setSaveMode] = useState();
  const [queuedForClose, setQueuedForClose ] = useState(false);
  const viewsLoading = useSelector(selectViewsLoading);
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !viewsLoading) {
      handleClose();
    }
  }, [queuedForClose, viewsLoading, handleClose])

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
    setQueuedForClose(true);
  };

  const handleAddDeploymentSubmit = (formVals) => {
    console.log('form submitted with values: ', formVals);
  };

  return (
    <div>
      <FormHeader>Add deployment to camera {cameraId}</FormHeader>
      <FormWrapper>
        <Formik
          initialValues={{
            name: '',
            description: '',
            latitude: '',
            longitude: '',
            startDate: null,
            editable: true,
          }}
          validationSchema={newDeploymentSchema}
          onSubmit={(values) => {
            handleAddDeploymentSubmit(values);
          }}              >
          {({ errors, touched, isValid, dirty }) => (
            <Form>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='name'>Name</label>
                  <Field
                    name='name'
                    id='name'
                  />
                  <ErrorMessage component={FormError} name='name' />
                </FormFieldWrapper>
              </FieldRow>
              <FieldRow>
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
              </FieldRow>
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='latitude'>Latitude</label>
                  <Field
                    name='latitude'
                    id='latitude'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='latitude'
                  />
                </FormFieldWrapper>
                <FormFieldWrapper>
                  <label htmlFor='longitude'>Longitude</label>
                  <Field
                    name='longitude'
                    id='longitude'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='longitude'
                  />
                </FormFieldWrapper>
              </FieldRow>

              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor='startDate'>Start Date</label>
                  <Field
                    component={DatePickerWithFormik}
                    // name="DatePickerWithFormik"
                    className="form-control"
                  />
                  <ErrorMessage
                    component={FormError}
                    name='startDate'
                  />
                </FormFieldWrapper>
              </FieldRow>

              <Field
                name='editable'
                type='hidden'
              />
              <ButtonRow>
                <Button
                  type='button'
                  size='large'
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  size='large'
                  disabled={!isValid || !dirty}
                >
                  Save
                </Button>
              </ButtonRow>
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </div>

  );
};

export default AddDeploymentForm;

