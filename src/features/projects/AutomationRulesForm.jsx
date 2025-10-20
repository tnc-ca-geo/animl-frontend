import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAutomationRules, selectAutomationRules, selectSelectedProject } from './projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';

const AutomationRulesForm = () => {
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
            automationRules={automationRules}
            availableModels={availableModels}
            hideAddRuleForm={hideAddRuleForm}
            rule={currentRule}
          />
        ) : (
          <AutomationRulesList
            automationRules={automationRules}
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

export default AutomationRulesForm;
