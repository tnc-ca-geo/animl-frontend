import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject } from './projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { SimpleSpinner, SpinnerOverlay } from '../../components/Spinner';

const AutomationRulesForm = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const availableModels = selectedProject.availableMLModels;
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [currentRule, setCurrentRule] = useState();

  const handleAddRuleClick = () => {
    setCurrentRule(null);
    setShowAddRuleForm(true);
  };
  const handleEditRuleClick = () => setShowAddRuleForm(true);
  const hideAddRuleForm = () => setShowAddRuleForm(false);

  return (
    <div>
      {availableModels.length && selectedProject ? (
        showAddRuleForm ? (
          <AddAutomationRuleForm
            project={selectedProject}
            availableModels={availableModels}
            hideAddRuleForm={hideAddRuleForm}
            rule={currentRule}
          />
        ) : (
          <AutomationRulesList
            project={selectedProject}
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
