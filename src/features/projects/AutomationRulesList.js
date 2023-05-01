import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { updateAutomationRules, selectAutomationRulesLoading, editView, selectViewsLoading } from '../projects/projectsSlice';
import IconButton from '../../components/IconButton';
import Button from '../../components/Button';
import { ButtonRow } from '../../components/Form';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';
import { TrashIcon } from '@radix-ui/react-icons';


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
  }
});


const RuleDescription = ({ rule, availableModels }) => {
  const model = availableModels.find((m) => m === rule.action.mlModel);
  return (
    <StyledRuleDescription>
      <RuleTitle>{rule.name}</RuleTitle>
      <p>
        {rule.event.type === 'image-added' && 
          `When an image is added, `
        }
        {rule.event.type === 'label-added' && 
          `When an ${rule.event.label} is detected, `
        }
        {rule.action.type === 'run-inference'
          ? `submit the image to ${model} for inference.`
          : `send an alert to ${rule.action.alertRecipients.join(', ')}.`
        }
      </p>
    </StyledRuleDescription>
  );
};


const AutomationRulesList = ({ project, availableModels, onAddRuleClick }) => {
  const automationRulesLoading = useSelector(selectAutomationRulesLoading);
  const dispatch = useDispatch();

  const handleRuleDeleteClick = (e) => {
    const ruleToRemove = e.currentTarget.dataset.rule;
    const rules = project.automationRules.filter((rule) => (
      rule._id.toString() !== ruleToRemove
    ));
    dispatch(updateAutomationRules({ automationRules: rules }));
  };

  return (
    <div>
      {automationRulesLoading.isLoading &&
        <SpinnerOverlay>
          <PulseSpinner />
        </SpinnerOverlay>
      }
      <div>
        <RulesList>
          {project.automationRules.map((rule) => {
            return (
              <Rule key={rule._id}>
                <RuleDescription rule={rule} availableModels={availableModels} />
                <IconButton
                  variant='ghost'
                  data-rule={rule._id}
                  onClick={handleRuleDeleteClick}
                >
                  <TrashIcon />
                </IconButton>
              </Rule>
            )
          })}
        </RulesList>
        <ButtonRow>
          <Button
            size='large'
            onClick={onAddRuleClick}
          >
            New rule
          </Button>
        </ButtonRow>
      </div>
    </div>
  );
};


export default AutomationRulesList;

