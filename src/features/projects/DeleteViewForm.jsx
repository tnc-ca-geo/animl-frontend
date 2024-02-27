import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { selectViewsLoading, selectSelectedView, editView } from './projectsSlice.js';
import Button from '../../components/Button.jsx';
import { FormWrapper, ButtonRow, HelperText } from '../../components/Form.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';

const ViewName = styled('span', {
  fontWeight: '$5',
});

const deleteViewSchema = Yup.object().shape({
  viewId: Yup.string().required('A view ID is required'),
});

const DeleteViewForm = ({ handleClose }) => {
  const [queuedForClose, setQueuedForClose] = useState(false);
  const viewsLoading = useSelector(selectViewsLoading);
  const selectedView = useSelector(selectSelectedView);
  const dispatch = useDispatch();

  // TODO: extract into hook?
  useEffect(() => {
    if (queuedForClose && !viewsLoading.isLoading) handleClose();
  }, [queuedForClose, viewsLoading.isLoading, handleClose]);

  const handleDeleteViewSubmit = (values) => {
    dispatch(editView('delete', values));
    setQueuedForClose(true);
  };

  return (
    <div>
      {viewsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper>
        <Formik
          initialValues={{ viewId: selectedView._id }}
          validationSchema={deleteViewSchema}
          onSubmit={(values) => handleDeleteViewSubmit(values)}
        >
          {() => (
            <Form>
              <HelperText>
                Are you sure you&apos;d like to delete the <ViewName>{selectedView.name}</ViewName> view?
              </HelperText>
              <Field name="viewId" type="hidden" />
              <ButtonRow>
                <Button type="submit" size="large">
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
