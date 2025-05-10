import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateAutomationRules, selectMLModels, fetchModels } from './projectsSlice.js';
import SelectField from '../../components/SelectField.jsx';
import Button from '../../components/Button.jsx';
import {
  FormWrapper,
  FieldRow,
  ButtonRow,
  FormFieldWrapper,
  FormError,
} from '../../components/Form.jsx';
import CategoryConfigList from './CategoryConfigList.jsx';

const emptyRule = {
  name: '',
  event: {
    type: {},
  },
  action: {
    type: {},
    categoryConfig: {},
  },
};

const addRuleSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('A name is required'),
  event: Yup.object().shape({
    type: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required('A trigger is required'),
    }),
    label: Yup.string().when('type.value', {
      is: (val) => val === 'label-added',
      then: Yup.string().required('You must specify a label'),
    }),
  }),
  action: Yup.object().shape({
    type: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required('An action is required'),
    }),
    model: Yup.object().when('type.value', {
      is: (val) => val === 'run-inference',
      then: Yup.object()
        .shape({
          label: Yup.string().required(),
          value: Yup.string().required('You must specify a model'),
        })
        .nullable(),
    }),
    alertRecipients: Yup.string().when('type.value', {
      is: (val) => val === 'send-alert',
      then: Yup.string()
        // .email('Email adderess is invalid')
        .test('email-list-test', 'One or more email addresses were invalid', function (value) {
          if (value) {
            let schema = Yup.string().email();
            const emails = value.replace(/\s/g, '').split(',');
            let pass = true;
            emails.forEach((email) => {
              if (!schema.isValidSync(email)) {
                pass = false;
              }
            });
            return pass;
          } else {
            return false;
          }
        })
        .required('One or more email addresses were invalid'),
    }),
  }),
});

const AddAutomationRuleForm = ({ project, availableModels, hideAddRuleForm, rule }) => {
  const dispatch = useDispatch();
  const models = useSelector(selectMLModels);

  // fetch model source records
  useEffect(() => {
    if (!models || !models.length) {
      dispatch(fetchModels({ _ids: availableModels }));
    }
  }, [models, availableModels, dispatch]);

  // save rule
  const handleSaveRulesSubmit = (formVals) => {
    const newRule = valsToRule(formVals);
    let newRules = [...project.automationRules];
    if (rule) {
      // we're updating an existing rule
      const ruleIndex = project.automationRules.findIndex((r) => r._id === rule._id);
      newRules[ruleIndex] = newRule;
    } else {
      // we're creating a new rule
      newRules = project.automationRules.concat(newRule);
    }
    dispatch(updateAutomationRules({ automationRules: newRules }));
    hideAddRuleForm();
  };

  // discard rule
  const handleDiscardRuleClick = () => hideAddRuleForm();

  return (
    <FormWrapper css={{ height: '95vh', color: 'red' }}>
      <Formik
        initialValues={rule ? ruleToVals(rule) : { ...emptyRule }}
        validationSchema={addRuleSchema}
        onSubmit={handleSaveRulesSubmit}
      >
        {({ values, errors, touched, setFieldValue, setFieldTouched, isValid, dirty }) => (
          <Form>
            {/* name */}
            <FieldRow>
              <FormFieldWrapper>
                <label htmlFor="rule-name">Rule name</label>
                <Field name="name" id="rule-name" value={values.name} placeholder="Rule name..." />
                <ErrorMessage component={FormError} name="name" />
              </FormFieldWrapper>
            </FieldRow>

            {/* trigger */}
            <FieldRow>
              <FormFieldWrapper>
                <SelectField
                  name="event.type"
                  label="Trigger"
                  value={values.event.type}
                  onChange={setFieldValue}
                  onBlur={setFieldTouched}
                  error={_.has(errors, 'event.type.value') && errors.event.type.value}
                  touched={touched.event}
                  options={[
                    { value: 'image-added', label: 'Image added' },
                    { value: 'label-added', label: 'Label added' },
                  ]}
                  isSearchable={false}
                />
              </FormFieldWrapper>
              {values.event.type.value === 'label-added' && (
                <FormFieldWrapper css={{ flexGrow: '0' }}>
                  <label htmlFor="event-label">Label</label>
                  <Field
                    id="event-label"
                    name="event.label"
                    value={values.event.label ? values.event.label : ''}
                  />
                  <ErrorMessage component={FormError} name="event.label" />
                </FormFieldWrapper>
              )}
            </FieldRow>

            {/* action */}
            <FieldRow>
              <FormFieldWrapper>
                <SelectField
                  name="action.type"
                  label="Action"
                  menuPlacement="top"
                  value={values.action.type}
                  onChange={(name, value) => {
                    setFieldValue(name, value);
                    if (value.value === 'send-alert') {
                      setFieldValue('action.categoryConfig', {});
                    } else if (value.value === 'run-inference') {
                      setFieldValue('action.model', null);
                    }
                  }}
                  onBlur={setFieldTouched}
                  error={_.has(errors, 'action.type.value') && errors.action.type.value}
                  touched={touched.action}
                  options={[
                    { value: 'run-inference', label: 'Run inference' },
                    { value: 'send-alert', label: 'Send alert' },
                  ]}
                  isSearchable={false}
                />
              </FormFieldWrapper>
              {values.action.type.value === 'run-inference' && (
                <FormFieldWrapper>
                  <SelectField
                    name="action.model"
                    label="Model"
                    menuPlacement="top"
                    value={values.action.model}
                    onChange={(name, value) => {
                      setFieldValue(name, value);
                      const selectedModel = models.find((m) => m._id === value.value);
                      const categoryConfig = {};
                      selectedModel.categories.forEach((cat) => {
                        categoryConfig[cat.name] = {
                          confThreshold: selectedModel.defaultConfThreshold,
                          disabled: false,
                        };
                      });
                      setFieldValue('action.categoryConfig', categoryConfig);
                    }}
                    onBlur={setFieldTouched}
                    error={_.has(errors, 'action.model.value') && errors.action.model.value}
                    touched={touched.action}
                    options={availableModels.map((model) => ({
                      value: model,
                      label: `${model}`,
                    }))}
                    isSearchable={false}
                  />
                </FormFieldWrapper>
              )}
              {values.action.type.value === 'send-alert' && (
                <FormFieldWrapper css={{ minWidth: '300px' }}>
                  <label htmlFor="action-alert-recipients">To</label>
                  <Field
                    name="action.alertRecipients"
                    id="action-alert-recipients"
                    value={values.action.alertRecipients ? values.action.alertRecipients : ''}
                    placeholder="Comma-separated list of email addresses..."
                  />
                  <ErrorMessage component={FormError} name="action.alertRecipients" />
                </FormFieldWrapper>
              )}
            </FieldRow>

            {/* category configurations */}
            {values.action.categoryConfig &&
              models &&
              Object.entries(values.action.categoryConfig).length > 0 && (
                <CategoryConfigList
                  selectedModel={models.find((m) => m._id === values.action.model.value) || null}
                  values={values}
                />
              )}

            <ButtonRow>
              <Button type="button" size="large" onClick={handleDiscardRuleClick}>
                Cancel
              </Button>
              <Button type="submit" size="large" disabled={!isValid || !dirty}>
                Save
              </Button>
            </ButtonRow>
          </Form>
        )}
      </Formik>
    </FormWrapper>
  );
};

// map from values to automation rule schema
function valsToRule({ name, event, action }) {
  const newRule = {
    name,
    event: {
      type: event.type.value,
      ...(event.label && { label: event.label }),
    },
    action: { type: action.type.value },
  };

  if (action.type.value === 'run-inference') {
    newRule.action.mlModel = action.model.value;
    newRule.action.categoryConfig = action.categoryConfig;
  } else if (action.type.value === 'send-alert') {
    const recipients = action.alertRecipients.replace(/\s/g, '').split(',');
    newRule.action.alertRecipients = recipients;
  }

  return newRule;
}

// map rule schema to form values (for updating an existing rule)
function ruleToVals(rule) {
  const mapValueToLabel = {
    'image-added': 'Image added',
    'label-added': 'Label added',
    'run-inference': 'Run inference',
    'send-alert': 'Send alert',
  };

  const vals = {
    ...rule,
    name: rule.name,
    event: {
      type: {
        value: rule.event.type,
        label: mapValueToLabel[rule.event.type],
      },
      ...(rule.event.label && { label: rule.event.label }),
    },
    action: {
      type: {
        value: rule.action.type,
        label: mapValueToLabel[rule.action.type],
      },
    },
  };

  if (rule.action.type === 'run-inference') {
    vals.action.model = { value: rule.action.mlModel, label: rule.action.mlModel };
    vals.action.categoryConfig = rule.action.categoryConfig;
  } else if (rule.action.type === 'send-alert') {
    const recipients = rule.action.alertRecipients.join(', ');
    vals.action.alertRecipients = recipients;
  }

  return vals;
}

export default AddAutomationRuleForm;
