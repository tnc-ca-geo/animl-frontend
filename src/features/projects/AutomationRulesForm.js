import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectSelectedProject,
  selectSelectedView
} from '../projects/projectsSlice';
import AddAutomationRuleForm from './AddAutomationRuleForm';
import AutomationRulesList from './AutomationRulesList';
import { PulseSpinner, SpinnerOverlay } from '../../components/Spinner';


const AutomationRulesForm = () => {
  const selectedProject = useSelector(selectSelectedProject);
  const selectedView = useSelector(selectSelectedView);
  const availableModels = selectedProject.availableMLModels;
  const [ showAddRuleForm, setShowAddRuleForm ] = useState(false);

  const handleAddRuleClick = () => setShowAddRuleForm(true);
  const hideAddRuleForm = () => setShowAddRuleForm(false);
  

  return (
    <div>
      {availableModels.length && selectedView
        ? showAddRuleForm
          ? <AddAutomationRuleForm
              view={selectedView}
              availableModels={availableModels}
              hideAddRuleForm={hideAddRuleForm}
            />
          : <AutomationRulesList
              view={selectedView}
              availableModels={availableModels}
              onAddRuleClick={handleAddRuleClick}
            />
        : <SpinnerOverlay>
            <PulseSpinner />
          </SpinnerOverlay>
      }
    </div>
  );
};


export default AutomationRulesForm;

