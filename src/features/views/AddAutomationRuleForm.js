import React from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { editView } from './viewsSlice';
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
    alertRecipient: Yup.string().when('type.value', {
      is: (val) => val === 'send-alert',
      then: Yup.string().email('Email adderess is invalid').required('You must specify a recipient'),
    }),
  }),
});

const AddAutomationRuleForm = ({ view, models, hideAddRuleForm }) => {
  const dispatch = useDispatch();

  const handleSaveRulesSubmit = ({name, event, action}) => {
    const newRule = {
      name,
      event: {
        type: event.type.value,
        ...(event.label && { label: event.label }),
      },
      action: {
        type: action.type.value,
        ...(action.model && { model: action.model.value }),
        ...(action.alertRecipient && { alertRecipient: action.alertRecipient }),
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
                      value: model._id,
                      label: `${model.name} ${model.version}`,
                    }))}
                  />
                </FormFieldWrapper>
              )}
              {values.action.type.value === 'send-alert' && (
                <FormFieldWrapper css={{ minWidth: '270px' }}>
                  <label htmlFor='action-alert-recipient'>To</label>
                  <Field
                    name='action.alertRecipient'
                    id='action-alert-recipient'
                    value={values.action.alertRecipient ? values.action.alertRecipient : ''}
                  />
                  <ErrorMessage
                    component={FormError}
                    name='action.alertRecipient'
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
                Discard
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