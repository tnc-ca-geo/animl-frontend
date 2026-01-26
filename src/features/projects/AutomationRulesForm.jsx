import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config';
import { fetchAutomationRules, selectAutomationRules, selectSelectedProject } from './projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import InfoIcon from '../../components/InfoIcon';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';

export const AutomationRulesForm = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const availableModels = selectedProject.availableMLModels;
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [currentRule, setCurrentRule] = useState();
  const automationRules = useSelector(selectAutomationRules);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAutomationRules());
  }, []);

  const handleAddRuleClick = () => {
    setCurrentRule(null);
    setShowAddRuleForm(true);
  };
  const handleEditRuleClick = () => setShowAddRuleForm(true);
  const hideAddRuleForm = () => setShowAddRuleForm(false);

  return (
    <div>
      {availableModels.length && selectedProject && automationRules ? (
        showAddRuleForm ? (
          <AddAutomationRuleForm
            availableModels={availableModels}
            hideAddRuleForm={hideAddRuleForm}
            rule={currentRule}
          />
        ) : (
          <AutomationRulesList
            availableModels={availableModels}
            onAddRuleClick={handleAddRuleClick}
            onEditRuleClick={handleEditRuleClick}
            setCurrentRule={setCurrentRule}
          />
        )
      ) : (
        <SpinnerOverlay>
          <SimpleSpinner />
        </SpinnerOverlay>
      )}
    </div>
  );
};

const TitleContainer = styled('div', {
  marginLeft: '$2',
  display: 'flex',
  alignItems: 'center',
  flex: '1'
});

export const AutomationRulesFormTitle = ({ title, tooltipContent }) => {
  return (
    <TitleContainer>
      {title && title}
      {tooltipContent &&
        <InfoIcon tooltipContent={tooltipContent} side='bottom' maxWidth={'350px'} />
      }
    </TitleContainer>
  );
};
