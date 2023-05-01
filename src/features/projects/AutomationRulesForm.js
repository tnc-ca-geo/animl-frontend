import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectSelectedProject } from '../projects/projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


const AutomationRulesForm = () => {
  const selectedProject = useSelector(selectSelectedProject);
  // const selectedView = useSelector(selectSelectedView);
  const availableModels = selectedProject.availableMLModels;
  const [ showAddRuleForm, setShowAddRuleForm ] = useState(false);
  const [ currentRule, setCurrentRule ] = useState();

  const handleAddRuleClick = () => {
    setCurrentRule(null);
    setShowAddRuleForm(true);
  }
  const handleEditRuleClick = () => setShowAddRuleForm(true);
  const hideAddRuleForm = () => setShowAddRuleForm(false);
  
  return (
    <div>
      {availableModels.length && selectedProject
        ? showAddRuleForm
          ? <AddAutomationRuleForm
              project={selectedProject}
              availableModels={availableModels}
              hideAddRuleForm={hideAddRuleForm}
              rule={currentRule}
            />
          : <AutomationRulesList
              project={selectedProject}
              availableModels={availableModels}
              onAddRuleClick={handleAddRuleClick}
              onEditRuleClick={handleEditRuleClick}
              setCurrentRule={setCurrentRule}
            />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};


export default AutomationRulesForm;

