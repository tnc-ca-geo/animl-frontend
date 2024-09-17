import React from 'react';
import Accordion from '../../components/Accordion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FormWrapper, FormError, FieldRow, ButtonRow } from '../../components/Form.jsx';
import { styled } from '../../theme/stitches.config.js';
import Button from '../../components/Button.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { commentsFilterChanged, selectCommentsFilter } from './filtersSlice.js';

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
});

const StyledButtonRow = styled(ButtonRow, {
  paddingBottom: '$0',
});

export const CommentsFilter = () => {
  const commentsFilter = useSelector(selectCommentsFilter);
  const dispatch = useDispatch();

  const handleRemoveButtonClick = () => dispatch(commentsFilterChanged(null));

  const handleCommentsFilterSubmit = (values) => {
    dispatch(commentsFilterChanged(values.filter));
  };

  return (
    <Accordion label="Comments" expandedDefault={false}>
      <div>
        <FormWrapper>
          <Formik
            enableReinitialize
            initialValues={{ filter: commentsFilter || '' }}
            onSubmit={(values) => handleCommentsFilterSubmit(values)}
          >
            <Form>
              <StyledFieldRow>
                <Field
                  name="filter"
                  id="filter"
                  component="textarea"
                  placeholder=""
                />
                <ErrorMessage component={FormError} name="filter" />
              </StyledFieldRow>
              <StyledButtonRow>
                <Button type="button" size="small" onClick={handleRemoveButtonClick}>
                  Remove
                </Button>
                <Button type="submit" size="small">
                  Apply
                </Button>
              </StyledButtonRow>
            </Form>
          </Formik>
        </FormWrapper>
      </div>
    </Accordion>
  );
}
