import React from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { editView } from '../projects/projectsSlice';
import SelectField from '../../components/SelectField';
import Button from '../../components/Button';
import {
  FormWrapper,
  FieldRow,
  ButtonRow,
  FormFieldWrapper,
  FormError
} from '../../components/Form';


const emptyRule = {
  name: '',
  event: {
    type: {},
  },
  action: {
    type: {},
  },
};

const addRuleSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('A name is required'),
  event: Yup.object().shape({
    type: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required('A trigger is required'),
    }),
    label: Yup.string().when('type.value', {
      is: (val) => val === 'label-added',
      then: Yup.string().required('You must specify a label'),
    })
  }),
  action: Yup.object().shape({
    type: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required('An action is required'),
    }),
    model: Yup.object().when('type.value', {
      is: (val) => val === 'run-inference',
      then: Yup.object().shape({
        label: Yup.string().required(),
        value: Yup.string().required('You must specify a model'),
      }),
    }),
    alertRecipients: Yup.string().when('type.value', {
      is: (val) => val === 'send-alert',
      then: Yup.string()
        // .email('Email adderess is invalid')
        .test(
          'email-list-test',
          'One or more email addresses were invalid', 
          function(value) {
            if (value) {
              let schema = Yup.string().email();
              const emails = value.replace(/\s/g, '').split(',');
              let pass = true;
              emails.forEach((email) => {
                if (!schema.isValidSync(email)) { pass = false }
              });
              return pass;
            }
            else {
              return false;
            }
          })
        .required('One or more email addresses were invalid'),
    }),
  }),
});

// TODO AUTH - add inputs for:
//    - confThreshold - used as default for categories w/o their own set thresholds 
//    - categoryConfig (confThreshold, disabled) - category-level config
const AddAutomationRuleForm = ({ view, models, hideAddRuleForm }) => {
  const dispatch = useDispatch();

  const handleSaveRulesSubmit = ({name, event, action}) => {
    console.log('handleSaveRuleSubmit firing with action: ', action)
    const newRule = {
      name,
      event: {
        type: event.type.value,
        ...(event.label && { label: event.label }),
      },
      action: {
        type: action.type.value,
        ...(action.model && { mlModel: action.model.value }),
        ...(action.alertRecipients && { 
          alertRecipients: action.alertRecipients.replace(/\s/g, '').split(',')
        }),
      },
    };
    const rules = view.automationRules.concat(newRule);
    const payload = {
      _id: view._id,
      diffs: {
        automationRules: rules,
      }
    };
    dispatch(editView('update', payload));
    hideAddRuleForm();
  };

  const handleDiscardRuleClick = () => hideAddRuleForm();

  return (
    <FormWrapper>
      <Formik
        initialValues={{
          ...emptyRule
        }}
        validationSchema={addRuleSchema} 
        onSubmit={handleSaveRulesSubmit}
      >
      {({values, errors, touched, setFieldValue, setFieldTouched, handleChange, isValid, dirty}) => {
        console.log('values.event.type: ', values.event.type)
        return (
          <Form>
            <FieldRow>
              <FormFieldWrapper>
                <label htmlFor='rule-name'>Rule name</label>
                <Field
                  name='name'
                  id='rule-name'
                  value={values.name}
                  placeholder='Rule name...'
                />
                <ErrorMessage
                  component={FormError}
                  name='name'
                />
              </FormFieldWrapper>
            </FieldRow>
            {/*<p>What event or condition should trigger your rule?</p>*/}
            <FieldRow>
              <FormFieldWrapper>
                <SelectField
                  name='event.type'
                  label='Trigger'
                  value={values.event.type}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  error={_.has(errors, 'event.type.value') &&
                    errors.event.type.value
                  }
                  touched={touched.event}
                  options={[
                    { value: 'image-added', label: 'Image added' },
                    { value: 'label-added', label: 'Label added' },
                  ]}
                />
              </FormFieldWrapper>
              {values.event.type.value === 'label-added' && (
                <FormFieldWrapper
                  css={{ flexGrow: '0' }}
                >
                  <label htmlFor='event-label'>Label</label>
                  <Field
                    id='event-label'
                    name='event.label'
                    value={values.event.label ? values.event.label : '' }
                  />
                  <ErrorMessage
                    component={FormError}
                    name='event.label'
                  />
                </FormFieldWrapper>
              )}
            </FieldRow>
            {/*<p>What action would you like to take?</p>*/}
            <FieldRow>
              <FormFieldWrapper>
                <SelectField
                  name='action.type'
                  label='Action'
                  value={values.action.type}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  error={_.has(errors, 'action.type.value') &&
                    errors.action.type.value
                  }
                  touched={touched.action}
                  options={[
                    { value: 'run-inference', label: 'Run inference' },
                    { value: 'send-alert', label: 'Send alert' },
                  ]}
                />
              </FormFieldWrapper>
              {values.action.type.value === 'run-inference' && (
                <FormFieldWrapper>
                  <SelectField
                    name='action.model'
                    label='Model'
                    value={values.action.model}
                    onChange={setFieldValue}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'action.model.value') &&
                      errors.action.model.value
                    }
                    touched={touched.action}
                    options={models.map((model) => ({
                      value: model,
                      label: `${model}`,
                    }))}
                  />
                </FormFieldWrapper>
              )}
              {values.action.type.value === 'send-alert' && (
                <FormFieldWrapper css={{ minWidth: '300px' }}>
                  <label htmlFor='action-alert-recipients'>To</label>
                  <Field
                    name='action.alertRecipients'
                    id='action-alert-recipients'
                    value={values.action.alertRecipients 
                      ? values.action.alertRecipients 
                      : ''
                    }
                    placeholder='Comma-separated list of email addresses...'
                  />
                  <ErrorMessage
                    component={FormError}
                    name='action.alertRecipients'
                  />
                </FormFieldWrapper>
              )}
            </FieldRow>
            <ButtonRow>
              <Button
                type='button'
                size='large'
                onClick={handleDiscardRuleClick}
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
      }
      </Formik>
    </FormWrapper>
  );
};

export default AddAutomationRuleForm;