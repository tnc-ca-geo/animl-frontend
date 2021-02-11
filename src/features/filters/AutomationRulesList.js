import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import SubmitButton from '../../components/SubmitButton';


const RuleTitle = styled.div({

});

const FieldRow = styled.div({
  paddingBottom: '$3',
  display: 'flex',
});

const ButtonRow = styled(FieldRow, {
  justifyContent: 'flex-end',
  button: {
    marginRight: '$3',
    ':last-child': {
      marginRight: '0',
    },
  }
});

const RuleDescription = ({ rule, models }) => {
  const model = models.find((model) => model._id === rule.action.model);

  return (
    <div>
      {rule.event.type === 'image-added' && 
        `When an image is added, `
      }
      {rule.event.type === 'label-added' && 
        `When an ${rule.event.label} is detected, `
      }
      {rule.action.type === 'run-inference'
        ? `submit the image to ${model.name} ${model.version} for inference.`
        : `send an alert to ${rule.action.alertRecipient}.`
      }
    </div>
  );
};


const AutomationRulesList = ({ view, models, onAddRuleClick }) => {
  console.log('view: ', view);
  console.log('models: ', models);
  return (
    <div>
      <div>Active Rules</div>
      <ul>
        {view.automationRules.map((rule) => {
          return (
            <li>
              <RuleTitle>{rule.name}</RuleTitle>
              <RuleDescription rule={rule} models={models} />
            </li>
          )
        })}
      </ul>
      <ButtonRow>
        <SubmitButton
          size='large'
          disabled={!view.editable}
          onClick={onAddRuleClick}
        >
          New rule
        </SubmitButton>
      </ButtonRow>
    </div>
  );
};

export default AutomationRulesList;

