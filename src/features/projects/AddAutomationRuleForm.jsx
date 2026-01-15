import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { iso31661, iso31662 } from 'iso-3166';
import {
  updateAutomationRules,
  selectMLModels,
  fetchModels,
  selectAutomationRules,
  selectModelsLoadingState,
} from './projectsSlice.js';
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
import { SpinnerOverlay, SimpleSpinner } from '../../components/Spinner.jsx';

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

const GeofencingTooltip = () => (
  <div style={{ maxWidth: '200px' }}>
    Select a country to limit the results to species that occur in that region. If no country is
    selected, no geographic filtering will be applied.
  </div>
);

const AddAutomationRuleForm = ({ availableModels, hideAddRuleForm, rule }) => {
  const dispatch = useDispatch();
  const models = useSelector(selectMLModels);
  const modelsLoading = useSelector(selectModelsLoadingState);
  const automationRules = useSelector(selectAutomationRules);

  // fetch model source records
  useEffect(() => {
    if (!models || !models.length) {
      dispatch(fetchModels({ _ids: availableModels }));
    }
  }, [models, availableModels, dispatch]);

  // save rule
  const handleSaveRulesSubmit = (formVals) => {
    const newRule = valsToRule(formVals);
    let newRules = [...automationRules];
    if (rule) {
      // we're updating an existing rule
      const ruleIndex = automationRules.findIndex((r) => r._id === rule._id);
      newRules[ruleIndex] = newRule;
    } else {
      // we're creating a new rule
      newRules = newRules.concat(newRule);
    }
    dispatch(updateAutomationRules({ automationRules: newRules }));
    hideAddRuleForm();
  };

  // discard rule
  const handleDiscardRuleClick = () => hideAddRuleForm();

  // countries for speciesnet geofencing (ISO 3166-1 alpha-3 codes)
  const countryOptions = useMemo(() => {
    return [
      { value: null, label: 'None' },
      ...iso31661.map((country) => ({
        value: country.alpha3,
        label: `${country.name}`,
      })),
    ];
  }, []);

  // subdivisions (e.g. provinces or states) for speceiesnet geofencing (ISO 3166-2 codes)
  const admin1RegionOptions = useMemo(() => {
    return [
      { value: null, label: 'None' },
      // NOTE: for now, speciesnet geofencing only supports admin1Regions from USA
      ...iso31662
        .filter((subdivision) => subdivision.parent === 'US')
        .map((sub) => ({
          value: sub.code,
          label: `${sub.name}`,
        })),
    ];
  }, []);

  const validateLabel = (val) => {
    let rulesLabels = [];
    automationRules.forEach((r) => {
      // only allow labels that are predicted by models used in prior rules
      if (r.action.type === 'run-inference') {
        const model = models.find((m) => m._id === r.action.mlModel);
        if (model) {
          rulesLabels = rulesLabels.concat(model.categories.map((cat) => cat.name));
        }
      }
    });
    if (!rulesLabels.includes(val)) {
      return "This label is not predicted by any models used in your prior rules. Please check the list of labels available by navigating to that Automation Rule.";
    }
  }

  return (
    <>
      {modelsLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <FormWrapper css={{ height: '95vh', color: 'red' }}>
        <Formik
          initialValues={rule ? ruleToVals(rule) : { ...emptyRule }}
          validationSchema={addRuleSchema}
          validateOnChange={false}
          onSubmit={handleSaveRulesSubmit}
        >
          {({ values, errors, touched, setFieldValue, setFieldTouched, isValid, dirty }) => (
            <Form>
              {/* name */}
              <FieldRow>
                <FormFieldWrapper>
                  <label htmlFor="rule-name">Rule name</label>
                  <Field
                    name="name"
                    id="rule-name"
                    value={values.name}
                    placeholder="Rule name..."
                  />
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
                      validate={validateLabel}
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
                    menuPlacement="bottom"
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
                      { value: 'run-inference', label: 'Request machine learning prediction' },
                      { value: 'send-alert', label: 'Send alert' },
                    ]}
                    isSearchable={false}
                  />
                </FormFieldWrapper>
                {models && values.action.type.value === 'run-inference' && (
                  <FormFieldWrapper>
                    <SelectField
                      name="action.model"
                      label="Model"
                      menuPlacement="bottom"
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
                      options={models.map((model) => ({
                        value: model._id,
                        label: `${model._id}`,
                        isDisabled: values.event.type.value === 'image-added' && model.expectsCrops === true,
                      }))}
                      isSearchable={false}
                      tooltip={"Only models that allow full-image processing are available when when the trigger is \"Image added.\""}
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

              {values.action.model && values.action.model.value === 'speciesnet-all' && (
                <FieldRow>
                  <FormFieldWrapper css={{ minWidth: '300px' }}>
                    <SelectField
                      name="action.country"
                      label="Country (optional)"
                      tooltip={<GeofencingTooltip />}
                      value={values.action.country}
                      onChange={setFieldValue}
                      onBlur={setFieldTouched}
                      error={_.has(errors, 'action.country.value') && errors.action.country.value}
                      touched={touched.action}
                      options={countryOptions}
                      isSearchable={true}
                    />
                  </FormFieldWrapper>

                  {values.action.country && values.action.country.value === 'USA' && (
                    <FormFieldWrapper css={{ minWidth: '300px' }}>
                      <SelectField
                        name="action.admin1Region"
                        label="State (optional)"
                        value={values.action.admin1Region}
                        onChange={setFieldValue}
                        onBlur={setFieldTouched}
                        error={
                          _.has(errors, 'action.admin1Region.value') && errors.action.country.value
                        }
                        touched={touched.action}
                        options={admin1RegionOptions}
                        isSearchable={true}
                      />
                    </FormFieldWrapper>
                  )}
                </FieldRow>
              )}

              <ButtonRow>
                <Button type="button" size="large" onClick={handleDiscardRuleClick}>
                  Cancel
                </Button>
                <Button type="submit" size="large" disabled={!isValid || !dirty}>
                  Save
                </Button>
              </ButtonRow>

              {/* category configurations */}
              {values.action.categoryConfig &&
                models &&
                Object.entries(values.action.categoryConfig).length > 0 && (
                  <CategoryConfigList
                    selectedModel={models.find((m) => m._id === values.action.model.value) || null}
                    values={values}
                  />
                )}
            </Form>
          )}
        </Formik>
      </FormWrapper>
    </>
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
    newRule.action.country = action.country ? action.country.value : null;
    newRule.action.admin1Region = action.admin1Region ? action.admin1Region.value : null;
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
    'run-inference': 'Request machine learning prediction',
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
    vals.action.country = rule.action.country
      ? {
          value: rule.action.country,
          label: iso31661.find((c) => c.alpha3 === rule.action.country).name,
        }
      : null;
    vals.action.admin1Region = rule.action.admin1Region
      ? {
          value: rule.action.admin1Region,
          label: iso31662.find((s) => s.code === rule.action.admin1Region).name,
        }
      : null;
  } else if (rule.action.type === 'send-alert') {
    const recipients = rule.action.alertRecipients.join(', ');
    vals.action.alertRecipients = recipients;
  }

  return vals;
}

export default AddAutomationRuleForm;
