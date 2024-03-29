import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { PlusIcon, Pencil2Icon } from '@radix-ui/react-icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { selectViewsLoading, selectSelectedView, selectUnsavedViewChanges, editView } from './projectsSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import Button from '../../components/Button.jsx';
import { FormWrapper, FieldRow, ButtonRow, FormFieldWrapper, FormError, HelperText } from '../../components/Form.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const SaveModeTab = styled(Button, {
  color: '$textDark',
  backgroundColor: '$loContrast',
  margin: '$0 $2',
  '&:hover': {
    backgroundColor: '$gray4',
    cursor: 'pointer',
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$blue200',
        borderColor: '$blue500',
        color: '$blue500',
        '&:hover': {
          backgroundColor: '$blue200',
          cursor: 'default',
        },
      },
    },
  },
});

const ViewName = styled('span', {
  fontWeight: '$5',
});

const newViewSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('A name is required'),
  description: Yup.string().min(2, 'Too Short!').max(500, 'Too Long!'),
});

const SaveViewForm = ({ handleClose }) => {
  const [saveMode, setSaveMode] = useState();
  const [queuedForClose, setQueuedForClose] = useState(false);
  const viewsLoading = useSelector(selectViewsLoading);
  const selectedView = useSelector(selectSelectedView);
  const activeFilters = useSelector(selectActiveFilters);
  const unsavedViewChanges = useSelector(selectUnsavedViewChanges);
  const dispatch = useDispatch();

  // handle closing
  useEffect(() => {
    if (queuedForClose && !viewsLoading.isLoading) handleClose();
  }, [queuedForClose, viewsLoading.isLoading, handleClose]);

  // handle saving and updating view
  const handleSaveViewSubmit = (operation, selectedView, formVals) => {
    if (operation === 'create') {
      dispatch(editView(operation, formVals));
    } else if (operation === 'update') {
      dispatch(
        editView(operation, {
          viewId: selectedView._id,
          diffs: { filters: formVals.filters },
        }),
      );
    }
    setQueuedForClose(true);
  };

  return (
    <div>
      {viewsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <div>
        <FieldRow css={{ justifyContent: 'center' }}>
          <SaveModeTab
            size="large"
            disabled={!selectedView.editable || !unsavedViewChanges}
            active={saveMode === 'update' ? true : false}
            onClick={() => setSaveMode('update')}
          >
            <Pencil2Icon />
            Update current view
          </SaveModeTab>
          <SaveModeTab
            size="large"
            active={saveMode === 'create' ? 'true' : 'false'}
            onClick={() => setSaveMode('create')}
          >
            <PlusIcon />
            Create new view
          </SaveModeTab>
        </FieldRow>
        {saveMode === 'update' && (
          <FormWrapper>
            <Formik
              initialValues={{ filters: activeFilters }}
              onSubmit={(values) => {
                handleSaveViewSubmit(saveMode, selectedView, values);
              }}
            >
              {() => (
                <Form>
                  <HelperText>
                    Are you sure you&apos;d like to overwrite the filters for the{' '}
                    <ViewName>{selectedView.name}</ViewName> view?
                  </HelperText>
                  <Field name="filters" type="hidden" />
                  <ButtonRow>
                    <Button size="large" type="submit">
                      Update view
                    </Button>
                  </ButtonRow>
                </Form>
              )}
            </Formik>
          </FormWrapper>
        )}
        {saveMode === 'create' && (
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
              }}
            >
              {({ isValid, dirty }) => (
                <Form>
                  {/* name */}
                  <FieldRow>
                    <FormFieldWrapper>
                      <label htmlFor="name">Name</label>
                      <Field name="name" id="name" />
                      <ErrorMessage component={FormError} name="name" />
                    </FormFieldWrapper>
                  </FieldRow>

                  {/* description */}
                  <FieldRow>
                    <FormFieldWrapper>
                      <label htmlFor="description">Description</label>
                      <Field name="description" id="description" component="textarea" />
                      <ErrorMessage component={FormError} name="description" />
                    </FormFieldWrapper>
                  </FieldRow>

                  {/* filters */}
                  <Field name="filters" type="hidden" />

                  {/* editable */}
                  <Field name="editable" type="hidden" />

                  <ButtonRow>
                    <Button type="submit" size="large" disabled={!isValid || !dirty}>
                      Save view
                    </Button>
                  </ButtonRow>
                </Form>
              )}
            </Formik>
          </FormWrapper>
        )}
      </div>
    </div>
  );
};

export default SaveViewForm;
