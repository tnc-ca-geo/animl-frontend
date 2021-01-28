import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../../components/Button';
import {
  selectSelectedView,
  selectModels,
  fetchModels,
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

const emptyRule = {
  event: {},
  action: {},
}

const AutomationRulesForm = ({ handleClose }) => {
  const selectedView = useSelector(selectSelectedView);
  const models = useSelector(selectModels);
  const dispatch = useDispatch();


  useEffect(() => {
    console.log('models: ', models)
    if (!models.length) {
        dispatch(fetchModels());
    }
  }, [models, dispatch]);

  const handleSaveRulesSubmit = (values) => {
    console.log('save rules: ', values);
    const payload = {
      _id: selectedView._id,
      diffs: {
        automationRules: values.rules,
      }
    };
    dispatch(editView('update', payload))
    handleClose();  // TODO: show loading & wait for success to close
  };

  return (
    <div>
      <Row>  
        <StyledForm>
          <Formik
            initialValues={{
              rules: selectedView.automationRules
            }}
            // TODO: add validation
            // validationSchema={deleteViewSchema} 
            onSubmit={handleSaveRulesSubmit}
          >
          {({values, handleChange}) => (
            <Form>
              <FieldArray name='rules' >
              {arrayHelpers => (
                <div>
                  {values.rules && values.rules.length > 0 && (
                    values.rules.map((rule, index) => {
                      return (
                        <div key={index}>
                          <label htmlFor='event-type'>Trigger</label>
                          <Field
                            as='select'
                            name={`rules.${index}.event.type`}
                            id='event-type'
                            value={rule.event.type}
                          >
                            <option value='' label='Select an event' />
                            <option value='image-added' label='Image added' />
                            <option value='label-added' label='Label added' />
                          </Field>
                          {rule.event.type === 'label-added' && (
                            <div>
                              <label htmlFor='event-label'>Label</label>
                              <Field
                                id='event-label'
                                name={`rules.${index}.event.label`}
                                value={rule.event.label ? rule.event.label : '' }
                              />
                            </div>
                          )}
                          <label htmlFor='action-type'>Action</label>
                          <Field
                            as='select'
                            name={`rules.${index}.action.type`}
                            id='action-type'
                            value={rule.action.type}
                          >
                            <option value='' label='Select an action' />
                            <option value='run-inference' label='Run inference' />
                            <option value='send-alert' label='Send alert' />
                          </Field>
                          {rule.action.type === 'run-inference' && (
                            <div>
                              <label htmlFor='action-model'>Model</label>
                              <Field
                                as='select'
                                name={`rules.${index}.action.model._id`}
                                id='action-model'
                                value={rule.action.model ? rule.action.model._id : '' }
                              >
                                <option value='' label='Select an model' />
                                {models.map((model) => (
                                  <option
                                    key={model._id}
                                    value={model._id}
                                    label={model.name + ' ' + model.version}
                                  />
                                ))}
                              </Field>
                            </div>
                          )}
                          {rule.action.type === 'send-alert' && (
                            <div>
                              <label htmlFor='action-alert-recipient'>To</label>
                              <Field
                                name={`rules.${index}.action.alertRecipient`}
                                id='action-alert-recipient'
                                value={rule.action.alertRecipient ? rule.action.alertRecipient : '' }
                              />
                            </div>
                          )}
                        </div>
                      )

                    })
                  )}
                  <button
                    type='button'
                    onClick={() => arrayHelpers.push(emptyRule)}
                  >
                    Add a rule
                  </button>
                  <div>
                    <Button type="submit">Save rules</Button>
                  </div>
                </div>
              )}
              </FieldArray>
            </Form>
          )}
          </Formik>
        </StyledForm>
      </Row>
    </div>
  );
};

export default AutomationRulesForm;

