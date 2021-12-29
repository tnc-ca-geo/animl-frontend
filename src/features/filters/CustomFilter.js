import React from 'react';
import { styled } from '../../theme/stitches.config.js';
import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Accordion from '../../components/Accordion';
import { FormWrapper, FieldRow, ButtonRow } from '../../components/Form';
import Button from '../../components/Button';

const StyledFormWrapper = styled(FormWrapper, {
  display: 'flex',
  width: '45px'
});

const StyledButtonRow = styled(ButtonRow, {
  paddingBottom: '$0'
})

const CustomFilter = () => {
  const dispatch = useDispatch();

  // const handleCheckboxChange = (e) => {
  //   const payload = {
  //     filterCat: 'labels',
  //     val: e.target.dataset.category,
  //   };
  //   dispatch(checkboxFilterToggled(payload));
  // };

  const customFilterSchema = Yup.object().shape({
    filter: Yup.string().required('A view ID is required'),
  });

  const handleCustomFilterSubmit = (values) => {
    console.log('applying custom filter: ', values)
    // dispatch(editView('delete', values));
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
            initialValues={{ filter: '' }}
            validationSchema={customFilterSchema}
            onSubmit={(values) => handleCustomFilterSubmit(values)}
          >
            {({ errors, touched }) => (
              <Form>
                <FieldRow>
                  <Field
                    name='filter'
                    id='filter'
                    component='textarea'
                  />
                </FieldRow>
                <StyledButtonRow>
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

