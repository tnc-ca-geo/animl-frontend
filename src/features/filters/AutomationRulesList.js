import React from 'react';
import { useDispatch } from 'react-redux';
import { editView } from '../views/viewsSlice';
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
  alignItems: 'center',
  padding: '$3 0',
  borderBottom: '$1 solid $gray300',
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
    margin: '0',
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
  const dispatch = useDispatch();

  const handleRuleDeleteClick = (e) => {
    const ruleToRemove = e.currentTarget.dataset.rule;
    const rules = view.automationRules.filter((rule) => (
      rule._id.toString() !== ruleToRemove
    ));
    const payload = {
      _id: view._id,
      diffs: {
        automationRules: rules,
      }
    };
    dispatch(editView('update', payload));
  };

  return (
    <div>
      <RulesList>
        {view.automationRules.map((rule) => {
          return (
            <Rule key={rule._id}>
              <RuleDescription rule={rule} models={models} />
              <IconButton
                variant='ghost'
                disabled={view && !view.editable}
                data-rule={rule._id}
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

