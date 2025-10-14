import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { updateAutomationRules, selectAutomationRulesLoading } from './projectsSlice.js';
import IconButton from '../../components/IconButton.jsx';
import Button from '../../components/Button.jsx';
import { ButtonRow } from '../../components/Form.jsx';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner.jsx';
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons';

const Rule = styled('li', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$3 0',
  borderBottom: '1px solid $gray3',
});

const RuleTitle = styled('div', {
  fontWeight: '$4',
});

const RulesList = styled('ul', {
  listSyle: 'none',
  padding: '0',
  marginTop: '0',
});

const StyledRuleDescription = styled('div', {
  fontSize: '$3',
  p: {
    color: '$textMedium',
    margin: '0',
    marginTop: '$1',
  },
});

const EditButtons = styled('div', {
  minWidth: '64px',
});

const RuleDescription = ({ rule, availableModels }) => {
  const model = availableModels.find((m) => m === rule.action.mlModel);
  return (
    <StyledRuleDescription>
      <RuleTitle>{rule.name}</RuleTitle>
      <p>
        {rule.event.type === 'image-added' && `When an image is added, `}
        {rule.event.type === 'label-added' && `When an ${rule.event.label} is detected, `}
        {rule.action.type === 'run-inference'
          ? `request a prediction from ${model}.`
          : `send an alert to ${rule.action.alertRecipients.join(', ')}.`}
      </p>
    </StyledRuleDescription>
  );
};

const AutomationRulesList = ({ automationRules, availableModels, onAddRuleClick, onEditRuleClick, setCurrentRule }) => {
  const automationRulesLoading = useSelector(selectAutomationRulesLoading);
  const dispatch = useDispatch();

  const handleRuleDeleteClick = (e) => {
    const ruleToRemove = e.currentTarget.dataset.rule;
    const rules = automationRules.filter((rule) => rule._id.toString() !== ruleToRemove);
    dispatch(updateAutomationRules({ automationRules: rules }));
  };

  const handleRuleEditClick = (e) => {
    const ruleToEdit = e.currentTarget.dataset.rule;
    const rule = automationRules.find((r) => r._id.toString() === ruleToEdit);
    setCurrentRule(rule);
    onEditRuleClick();
  };

  return (
    <div>
      {automationRulesLoading.isLoading && (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
      <div>
        <RulesList>
          {automationRules.map((rule) => {
            return (
              <Rule key={rule._id}>
                <RuleDescription rule={rule} availableModels={availableModels} />
                <EditButtons>
                  <IconButton variant="ghost" data-rule={rule._id} onClick={handleRuleEditClick}>
                    <Pencil1Icon />
                  </IconButton>
                  <IconButton variant="ghost" data-rule={rule._id} onClick={handleRuleDeleteClick}>
                    <TrashIcon />
                  </IconButton>
                </EditButtons>
              </Rule>
            );
          })}
        </RulesList>
        <ButtonRow>
          <Button size="large" onClick={onAddRuleClick}>
            New rule
          </Button>
        </ButtonRow>
      </div>
    </div>
  );
};

export default AutomationRulesList;
