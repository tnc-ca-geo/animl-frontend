import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import parser from 'mongodb-query-parser';
import {
  customFilterApplied,
  customFilterRemoved,
  selectCustomFilter
} from './filtersSlice';
import Accordion from '../../components/Accordion';
import { FormWrapper, FormError, FieldRow, ButtonRow } from '../../components/Form';
import Button from '../../components/Button';

const StyledFormWrapper = styled(FormWrapper, {
  // display: 'flex',
  // width: '45px'
});

const StyledFieldRow = styled(FieldRow, {
  display: 'block',
});

const StyledButtonRow = styled(ButtonRow, {
  paddingBottom: '$0'
});

const CustomFilter = () => {
  const customFilter = useSelector(selectCustomFilter);
  const dispatch = useDispatch();

  // const handleCheckboxChange = (e) => {
  //   const payload = {
  //     filterCat: 'labels',
  //     val: e.target.dataset.category,
  //   };
  //   dispatch(checkboxFilterToggled(payload));
  // };

  const customFilterSchema = Yup.object().shape({
    filter: Yup.mixed().test(
      'is-valid-query',
      'Must be a valid MongoDB query',
      value => {
        const filter = parser.isFilterValid(value);
        return filter ? true : false;
      }, 
    ),
  });

  const handleRemoveButtonClick = () => {
    dispatch(customFilterRemoved());
  };

  const handleCustomFilterSubmit = (values) => {
    console.log('applying custom filter: ', values.filter);
    dispatch(customFilterApplied(values.filter));
    // setQueuedForClose(true);
  };

  return (
    <Accordion
      label='Custom'
      expandedDefault={false}
    >
      <div>
        <StyledFormWrapper>
          <Formik
            enableReinitialize
            initialValues={{ filter: customFilter || '' }}
            validationSchema={customFilterSchema}
            onSubmit={(values) => handleCustomFilterSubmit(values)}
          >
            {({ errors, touched }) => (
              <Form>
                <StyledFieldRow>
                  <Field
                    name='filter'
                    id='filter'
                    component='textarea'
                    placeholder="{ 'objects.labels': { $size: 0 } }"
                  />
                  <ErrorMessage component={FormError} name='filter' />
                </StyledFieldRow>
                <StyledButtonRow>
                  <Button
                    type='button'
                    size='small'
                    onClick={handleRemoveButtonClick}
                  >
                    Remove
                  </Button>
                  <Button type='submit' size='small'>
                    Apply
                  </Button>
                </StyledButtonRow>
              </Form>
            )}
          </Formik>
        </StyledFormWrapper>
      </div>
    </Accordion>
  );
};

export default CustomFilter;

