import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';
import SubmitButton from '../../components/SubmitButton';



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

const Rule = styled('li', {
  display: 'flex',
  justifyContent: 'space-between',
});

const RuleTitle = styled.div({
  fontWeight: '$4',
});

const RulesList = styled('ul', {
  listSyle: 'none',
  padding: '0',
  marginTop: '0',
});

const StyledRuleDescription = styled.div({
  fontSize: '$3',
  p: {
    color: '$gray600',
    marginTop: '$1',
  }
})

const RuleDescription = ({ rule, models }) => {
  const model = models.find((model) => model._id === rule.action.model);

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
          ? `submit the image to ${model.name} ${model.version} for inference.`
          : `send an alert to ${rule.action.alertRecipient}.`
        }
      </p>
    </StyledRuleDescription>
  );
};


const AutomationRulesList = ({ view, models, onAddRuleClick }) => {
  const handleRuleDeleteClick = (e) => {
    console.log('rule to delete: ', e.target.dataset.rule);
  };

  return (
    <div>
      <RulesList>
        {view.automationRules.map((rule) => {
          return (
            <Rule>
              <RuleDescription rule={rule} models={models} />
              <IconButton
                variant='ghost'
                disabled={view && !view.editable}
                data-rule={rule}
                onClick={handleRuleDeleteClick}
              >
                <FontAwesomeIcon icon={['fas', 'trash-alt']} />
              </IconButton>
            </Rule>
          )
        })}
      </RulesList>
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

